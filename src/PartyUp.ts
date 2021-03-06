const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

class PartyUp {
    message:any;

    constructor(message:any) {
        this.message = message;
    }

    async getValue():Promise<any> {
        //some basic weirdness checks
        if(!this.message && !this.message.author && !this.message.author.tag) {
            return null;
        }
    }
}

export { PartyUp };
