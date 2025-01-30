class CustomLogging {
    constructor() {
        // Check if DEBUG is enabled from environment variables
        this.debugging = process.env.DEBUG !== undefined;
    }

    log(message) {
        if (this.debugging) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
        }
    }

    error(message) {
        if (this.debugging) {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        }
    }
}

// Export a single instance to use across the app
module.exports = new CustomLogging();
