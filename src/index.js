const express = require("express");
const fetch = require("node-fetch");
const customLogging = require("./customLogging");

const app = express();
app.use(express.json());

app.all("/", async (req, res) => {
    try {
        // Get the endpoint url with default value
        let plausibleEndpoint = process.env.PLAUSIBLE_ENDPOINT || "https://plausible.io/api/event";
        let debugging = process.env.DEBUG !== undefined; // Grab production field, default to false if it does not exist.
        // Get the payload
        const plausibleDomain = req.headers["plausible-domain"];
        if (!plausibleDomain) {
            console.warn("Missing Plausible-Domain in headers.");
            return res.status(400).send("Missing Plausible-Domain header.");
        }
        customLogging.log(`Plausible Domain: ${plausibleDomain}`);
        const { type, event, properties = {}, context = {}, request_ip, plausibleProps = {} } = req.body;
        let eventName = type === "page" ? "pageview" : type === "track" ? event : null;
        customLogging.log(`Event Type: ${type}`);
        customLogging.log(`Event Name: ${eventName}`);
        // Ignore irrelevant events
        if (!eventName) {
            return res.status(202).send("Ignored event type.");
        }
        // Construct request body for Plausible
        const plausibleRequestBody = {
            domain: plausibleDomain,
            name: eventName,
            url: properties.url || "",
            referrer: context.page?.referrer || "",
            ...(Object.keys(plausibleProps).length ? { props: plausibleProps } : {}),
        };
        // Set headers for Plausible request
        const plausibleRequestHeaders = {
            "Content-Type": "application/json",
        };
        plausibleRequestHeaders["User-Agent"] = context.userAgent || "Unknown-User-Agent";
        // Only add x forwarded for if the ip exists in the payload.
        if (request_ip) {
            plausibleRequestHeaders["X-Forwarded-For"] = request_ip;
        }
        customLogging.log(`Outgoing Headers: ${JSON.stringify(plausibleRequestHeaders)}`);
        customLogging.log(`Outgoing Body: ${JSON.stringify(plausibleRequestBody)}`);
        // Send request to Plausible
        const plausibleResponse = await fetch(plausibleEndpoint, {
            method: "POST",
            headers: plausibleRequestHeaders,
            body: JSON.stringify(plausibleRequestBody),
        });
        // Handle Plausible failing.
        let responseText;
        if (debugging) {
            responseText = await plausibleResponse.text(); 
        }
        customLogging.log(`Plausible Response: ${responseText}`);
        customLogging.log(`Response Status: ${plausibleResponse.status}`);
        if (!plausibleResponse.ok) {
            console.error("Plausible API Error:", responseText);
            return res.status(plausibleResponse.status).send(responseText);
        }
        return res.status(plausibleResponse.status).send("Success");
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Handle CORS preflight requests
app.options("/", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Plausible-Domain",
        "Access-Control-Max-Age": "86400",
    });
    res.status(204).send();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});