# Rudderstack To Plausible Webhook
This code is designed to work with a Cloud Run instance to form as a conduit between Rudderstack and Plausible Analytics.  I opted for Cloud Run as the Cloudflare headers can mess with the way that Plausible tracks. Plausible really needs to add the option to use custom headers as opposed to X-Forwarded-For.

## Why would you want this?
Plausible is a fast and privacy friendly analytics platform that will allow you to track core web metrics without breaching GDPR or other privacy standards.  Currently there is no direct connection between Rudderstack and Plausible (I would love for them to make one!). This tool will allow you to create a webhook in Rudderstack, with no transformation required, and send pageviews and events to Plausible through their events API. 

## This webhook is designed to work with multiple domains at a time.  I.e you have the one worker for all of your Plausible domains. 
Domain is determined by a header value Plausible-Domain.  I opted for this rather than determining it from the page object so that you can have more control over it in case it what you called it varies slightly.  Make sure you include this in the headers of the request as this webhook will look for that.

## Other Vars
1. PLAUSIBLE_ENDPOINT: This optional and dictates the plausible endpoint that the request will be sent to.  It will default to https://plausible.io/api/event if the value does not exist.  This is so you can direct to a custom endpoint if you self host or reverse proxy (note since this is a server-side connection the reverse proxy does not matter so much).  

2. DEBUG: Set this variable if you want to enable some logging for your setup. This is helpful if for some reason the data is not appearing in Plausible as you expect. The value can be anything as it just looks to see if the env var is there.

# Getting Started
[![Deploy to Google Cloud Run](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run/?git_repo=https://github.com/jamesMorgan654/plausible_rudderstack_webhook)

## Using the CLI
1. Clone/Fork the Git Repo and make any adjustments you want.
2. Deploy to GCP. NOTE: Make any changes to envs.
```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/plausible-webhook
gcloud run deploy plausible-webhook --image gcr.io/$(gcloud config get-value project)/plausible-webhook --platform managed --region us-central1 --allow-unauthenticated --port 8080 --memory 256Mi --cpu 0.25 --set-env-vars "PLAUSIBLE_ENDPOINT=https://plausible.yoursite.com/api/event,DEBUG=true"
```