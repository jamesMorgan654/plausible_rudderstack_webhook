async function handleRequest(request, env) {
    try {
        // Get the endpoint url with default value
        let plausibleEndpoint = env.PLAUSIBLE_ENDPOINT || "https://plausible.io/api/event";
        // Get the payload
        const plausibleDomain = request.headers.get('Plausible-Domain');
        if (!plausibleDomain) {
            console.warn('There was no plausible domain found in the headers.');
            return new Response('There was no plausible domain found in the headers.', { status: 400 });
        }
        console.log(`Plausible Domain: ${plausibleDomain}`);
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        // Process the event type, if not the right event ignore
        const eventType = body.type;
        let eventName;
        if (eventType == "page") {
            eventName = "pageview";
        } else if (eventType == "track") {
            eventName = body.event;
        }
        if (eventName) {
            // Structure the request to Plausible
            let plausibleRequestHeaders = {
                "User-Agent": body.context?.userAgent || "Default-User-Agent",
            }
            if (body.request_ip) {
                plausibleRequestHeaders["X-Forwarded-For"] = body.request_ip;
            }

            let plausibleRequestBody = {
                domain: plausibleDomain,
                name: eventName,
                url: body.properties?.url || "",
                referrer: body.context?.page?.referrer || "",
            }
            // Look to see if there is a key called plausibleProps in the body (you can add further detail through transformations if you want).
            if (body.plausibleProps) {
                plausibleRequestBody.props = body.plausibleProps
            }
            console.log(JSON.stringify(plausibleRequestBody));
            // Send data to Plausible
            const response = await fetch (plausibleEndpoint, {
                    method: 'POST',
                    headers: plausibleRequestHeaders,
                    body: JSON.stringify(plausibleRequestBody)
                }
            )
            if (response.ok) {
                return new Response( 'Success', { status: 200 });
            } else {
                const responseText = await response.text();
                console.log(responseText);
                return new Response(`Failed to push to Plausible events API`, { status: 500 });
            }
        } else {
            return new Response('Wrong event type', { status: 202 }); //Ignore Identify etc
        }        
    } catch (error) {
        console.error('Error processing request:', error.message);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}

export default {
    async fetch(request, env, ctx) {
        const method = request.method;
        if (method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST",
                    "Access-Control-Allow-Headers": "Content-Type, Plausible-Domain",
                    "Access-Control-Max-Age": "86400"
                },
            });
        }
        if (method === "POST") {
           return handleRequest(request, env);
        } else {
            return new Response(`Method Not Allowed.`, { status: 405 });
        }
    },
};