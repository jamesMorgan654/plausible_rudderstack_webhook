# Rudderstack To Plausible Webhook
This code is designed to work with a Cloudflare worker to form as a conduit between Rudderstack and Plausible Analytics.
## Why would you want this?
Plausible is a fast and privacy friendly analytics platform that will allow you to track core web metrics without breaching GDPR or other privacy standards.  Currently there is no direct connection between Rudderstack and Plausible (I would love for them to make one!). This tool will allow you to create a webhook in Rudderstack, with no transformation required, and send pageviews and events to Plausible through their events API. 

## This webhook is designed to work with multiple domains at a time.  I.e you have the one worker for all of your Plausible domains. 
Domain is determined by a header value Plausible-Domain.  I opted for this rather than determining it from the page object so that you can have more control over it in case it what you called it varies slightly.  Make sure you include this in the headers of the request as this webhook will look for that.

## Other Vars

1. PLAUSIBLE_ENDPOINT: This optional and dictates the plausible endpoint that the request will be sent to.  It will default to https://plausible.io/api/event if the value does not exist.  This is so you can direct to a custom endpoint if you self host or reverse proxy (note since this is a server-side connection the reverse proxy does not matter so much).  

# Getting Started
Once you have cloned this repository you will need to edit the wrangler file to match the KV binding to your own one.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jamesMorgan654/plausible-webhook)