const detoxRoleID = "802258465472380969";
const nwChannelID = "817980179443744798";

class SignUp {
    client:any;

    constructor(client: any) {
        this.client = client;
    }

    async startSignup(msg: any):Promise<any> {
        console.log("start signUp called by: " + msg.author.tag);
        let message:string[] = msg.content.split(" ");
        if(message.length !== 2) {
            msg.reply("The format is not valid.  please use .signUp mm-dd-yy");
            return;
        }
        let regex:RegExp = new RegExp(/^((0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{2})$/);
        if(!regex.test(message[1])) {
            msg.reply("The format is not valid.  please use .signUp mm-dd-yy");
            return;
        }

        let dmy:string[] = message[1].split('-');
        let day = new Date(Number("20" + dmy[2]), Number(dmy[0])-1, Number(dmy[1])).getDay();
        var weekday=new Array(7);
        weekday[0]="Sunday";
        weekday[1]="Monday";
        weekday[2]="Tuesday";
        weekday[3]="Wednesday";
        weekday[4]="Thursday";
        weekday[5]="Friday";
        weekday[6]="Saturday";

        const embed = {
            color: 0x00FF00,
            author: {
                name: 'War signup for ' + message[1],
                icon_url: 'https://imgur.com/qTJkE5x.png',
                url: 'https://discord.gg/detox',
            },
            title: "Detox War Sign Up for war on: " + weekday[day],
            description: 'React 👍 if you are, 👎 if you are not able to come to war',
            thumbnail: {
                url: 'https://imgur.com/qTJkE5x.png',
            }
        };

        let nwChannel = this.client.channels.resolve(nwChannelID);

        nwChannel.send({'embed': embed}).then((signUpMsg:any) => {
            signUpMsg.react('👍');
            signUpMsg.react('👎');
            msg.delete();
        });
    }
}

export { SignUp };
