const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

class Attendance {
    message:any;

    constructor(message:any) {
        this.message = message;
    }

    async getValue():Promise<any> {
        //some basic weirdness checks
        if(!this.message && !this.message.author && !this.message.author.tag) {
            return null;
        }
        let user:string = "@" + this.message.author.tag;

        //Access Detox Member Statistics
        const doc = new GoogleSpreadsheet('1Cr-GiObaSizG8jYvD5XBz9VEXdXK1o_f7kby9MI8xEI');
        await doc.useServiceAccountAuth(creds).catch((error:any) => {
            console.log(error);
        });
    
        await doc.loadInfo();

        //Get the form submissions and currentMember data by row
        let currentMembers = doc.sheetsById[606827368];
        let AttendanceSheet = doc.sheetsById[2133984907];
        //
        let rowOptions = {
        }
        let currentRows = await currentMembers.getRows(rowOptions);

        //get members in the offense channel(will contain mercs)
        const offenseChannel = this.message.guild.channels.get('813570592237813798');
        const defenseChannel = this.message.guild.channels.get('813570624160923709');

        let connectedMembers:string[] = [];
        let unknownNames:string[] = [];

        offenseChannel.members.forEach((member:any) => {
            //connectedMembers.push("@" + member.user.tag);
            let familyName = currentRows.find((row:any) => row['Discord Tag'] === "@" + member.user.tag);
            if(familyName) {
                connectedMembers.push(familyName['Family Name']);
            } else {
                unknownNames.push("@" + member.user.tag);
            }
        });

        defenseChannel.members.forEach((member:any) => {
            //connectedMembers.push("@" + member.user.tag);
            let familyName = currentRows.find((row:any) => row['Discord Tag'] === "@" + member.user.tag);
            if(familyName) {
                connectedMembers.push(familyName['Family Name']);
            } else {
                unknownNames.push("@" + member.user.tag);
            }
        });

        connectedMembers.sort();
        unknownNames.sort();
        
        
        await AttendanceSheet.resize({rowCount: 200, columnCount: AttendanceSheet.columnCount + 1})
        await AttendanceSheet.loadCells({ // GridRange object
            startRowIndex: 0, endRowIndex: 200, startColumnIndex:AttendanceSheet.columnCount -1, endColumnIndex: AttendanceSheet.columnCount
        });
        const cell1 = AttendanceSheet.getCell(0, AttendanceSheet.columnCount -1);
        let dateObj = new Date();
        let month = dateObj.getUTCMonth() + 1;
        let day = dateObj.getUTCDate();
        let year = dateObj.getUTCFullYear();
        
        cell1.value = month + '/' + day + '/' + year;


        let cellIndex:number = 1;
        connectedMembers.forEach((name:any) => {
            const cellToWrite = AttendanceSheet.getCell(cellIndex, AttendanceSheet.columnCount -1);
            cellToWrite.value = name;
            cellIndex++;
        });

        unknownNames.forEach((name:any) => {
            const cellToWrite = AttendanceSheet.getCell(cellIndex, AttendanceSheet.columnCount -1);
            cellToWrite.value = name;
            cellIndex++;
        });

        await AttendanceSheet.saveUpdatedCells();
        console.log("attendance call by: " + this.message.author.tag);
        this.message.reply("attendance record <:pepeThumbsUp:821090039567613962>");

    }
}

export { Attendance };
