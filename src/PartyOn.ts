const {
    GoogleSpreadsheet
} = require('google-spreadsheet');
const creds = require('../toxbot-google-creds.json');

type warStuctureType = {
    [key: string]: any
};
const acceptableWarSize = ["30", "100"];
const WarStructure: warStuctureType = {
    "30": {
        "minMain": 17,
        "maxMain": 22,
        "minFlex": 3,
        "maxFlex": 6,
        "minDefense": 2,
        "maxDefense": 3,
        "Cannon": 1,
        "Anti-Cannon": 0,
        "mercMax": 3
    },
    "100": {
        "Main": 60,
        "Flex": 20,
        "Defense": 7,
        "Cannon": 7,
        "Anti-Cannon": 6
    }
};


class PartyOn {
    message: any;
    args: string[];

    constructor(message: any) {
        this.message = message;
        this.args = this.message.content.split(' ');
    }

    async getValue(): Promise < any > {
        if (!this.message && !this.message.author && !this.message.author.tag) {
            return;
        }
        console.log("@" + this.message.author.tag + " called: " + this.message);

        //init args
        let nodeSize: string = "";
        let paGroups = null;
        let inGroup: number = 0;
        let mainShotcallerCount: number = 0;
        let flexShotcallerCount: number = 0;
        let defenseShotcallerCount: number = 0;
        let mainPlat: any[] = [];
        let mainPlat2: any[] = [];
        let mainPlat3: any[] = [];
        let mainPlat4: any[] = [];
        let flexPlat: any[] = [];
        let flexPlat2: any[] = [];
        let cannonPlat: any[] = [];
        let defensePlat: any[] = [];
        let anticannonPlat: any[] = [];
        let paGroup1: any[] = [];
        let paGroup2: any[] = [];
        let paGroup3: any[] = [];

        if (this.args.length > 0) {
            nodeSize = String(this.args[1]);
        }
        if (this.args.length > 1) {
            paGroups = String(this.args[2]);
        }

        //validate the commands
        if (!nodeSize) {
            this.message.reply('nodeSize was not set or is not a number.  Format is: ```.partyUp <nodeSize(100)> <paGroups(3)> <cannonTeamSize(3)>```');
            return;
        } else if (!paGroups) {
            this.message.reply('paGroups was not set or is not a number.  Format is: ```.partyUp <nodeSize(100)> <paGroups(3)> <cannonTeamSize(3)>```');
            return;
        }
        if (!WarStructure[nodeSize] || !WarStructure[nodeSize].minMain) {
            this.message.reply('nodeSize is not an acceptable node size.  currentSizes are: ```' + acceptableWarSize.toString() + '```');
            return
        }

        //get members in the offense channel(will contain mercs)
        const warChannel = this.message.guild.channels.get('813570592237813798');
        let connectedMembers: any[] = [];
        warChannel.members.forEach((member:any) => {
             connectedMembers.push("@" + member.user.tag);
        });

        // connectedMembers.push("@softnips#2705");
        // connectedMembers.push("@Conture#4678");
        // connectedMembers.push("@[66th] Hugoboss#5924");
        // connectedMembers.push("@Toogar#1730");
        // connectedMembers.push("@Calamity#5423");
        // connectedMembers.push("@XeroZero0#5614");
        // connectedMembers.push("@Vala#0001");
        // connectedMembers.push("@tiger7512#5316");
        // connectedMembers.push("@ZecretSquirreL#1520");
        // connectedMembers.push("@Plats#8676");
        // connectedMembers.push("@test#1234");
        // connectedMembers.push("@test2#5678");
        // connectedMembers.push("@test3#9999");
        // connectedMembers.push("@Diamond#1147");
        // connectedMembers.push("@biian#4199");
        // connectedMembers.push("@Cufu#0808");
        // connectedMembers.push("@FabAstronaut#9999");
        // connectedMembers.push("@Twinkie#2490");
        // connectedMembers.push("@Mentor5thForm#5918");
        // connectedMembers.push("@Cierra#7556");
        // connectedMembers.push("@Henry#4358");
        // connectedMembers.push("@catinthehat#0266");
        // connectedMembers.push("@Jana#9114");
        // connectedMembers.push("@JoliPixy#2303");
        // connectedMembers.push("@Kasted#0419");
        // connectedMembers.push("@mjkmike#9034");
        // connectedMembers.push("@Pwn#0002");
        // connectedMembers.push("@OldOak#1584");
        // connectedMembers.push("@Ashco#5757");
        // connectedMembers.push("@OnRepeat#2819");
        // connectedMembers.push("@Cat Pettington#4715");
        // connectedMembers.push("@Kelso#2403");
        // connectedMembers.push("@Demoz#5981");
        // connectedMembers.push("@iTzKryptic#3018");
        // connectedMembers.push("@Cadra#7845");

        //Access Detox Member Statistics
        const doc = new GoogleSpreadsheet('1Cr-GiObaSizG8jYvD5XBz9VEXdXK1o_f7kby9MI8xEI');
        await doc.useServiceAccountAuth(creds).catch((error: any) => {
            console.log(error);
        });

        await doc.loadInfo();

        //Get the form submissions and currentMember data by row
        let currentMembersSpreadsheet = doc.sheetsById[606827368];
        let rowOptions = {
            limit: 101
        }
        let spreadsheetRows = await currentMembersSpreadsheet.getRows(rowOptions);

        let currentMembers: any[] = [];
        spreadsheetRows.forEach((row: any) => {
            if ((row['Family Name'] && row['Discord Tag']) && connectedMembers.indexOf(row['Discord Tag']) !== -1) {
                currentMembers.push({
                    familyName: row['Family Name'],
                    discordTag: row['Discord Tag'],
                    plat1: row['Platoon'],
                    plat2: row['Secondary Platoon'],
                    paPriority: Number(row['PA Priority']),
                    groupPriority: Number(row['Group Priority']),
                    group2Priority: Number(row['Group2 Priority'])
                });
            }
        });

        //Get the Known Mercs by row
        let mercSpreadsheet = doc.sheetsById[912568654];
        let mercOptions = {}
        let mercRow = await mercSpreadsheet.getRows(mercOptions);

        //get all connected people not in sheet
        let unknownUsers: any[] = [];
        connectedMembers.forEach((connected: any) => {
            if (currentMembers.findIndex(p => p.discordTag == connected) === -1) {
                unknownUsers.push(connected);
            }
        });

        //get the connected known mercs
        let currentMercs: any[] = [];
        mercRow.forEach((row: any) => {
            if ((row['Family Name'] && row['Discord Tag']) && unknownUsers.indexOf(row['Discord Tag']) !== -1) {
                currentMercs.push({
                    familyName: row['Family Name'],
                    discordTag: row['Discord Tag'],
                    plat1: row['Platoon'],
                    plat2: row['Secondary Platoon'],
                    paPriority: Number(row['PA Priority']),
                    groupPriority: Number(row['Group Priority']),
                    group2Priority: Number(row['Group2 Priority'])
                });
                unknownUsers.splice(unknownUsers.indexOf(row['Discord Tag']), 1);
            }
        });

        //append known mercs to connectedMembers
        currentMembers.push(...currentMercs);

        //get defense shotcallers
        let defenseShotcaller = currentMembers.filter((member: any) => {
            if (member.plat1 === "Defense Shotcaller") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        if (defenseShotcaller.length > 0) {
            defensePlat.push(defenseShotcaller[0]);
            inGroup++;
            currentMembers.splice(currentMembers.findIndex(p => p.discordTag == defenseShotcaller[0].discordTag), 1);
        } else {
            let backupDefenseCaller = currentMembers.filter((member: any) => {
                if (member.plat2 === "Defense Shotcaller") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            if (backupDefenseCaller.length > 0) {
                defensePlat.push(backupDefenseCaller[0]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupDefenseCaller[0].discordTag), 1);
            } else {
                //TODO:Figure wtf to do here
                console.log("No defense Shotcaller has been detected");
            }
        }

        //get main shotcallers
        let mainShotcallers = currentMembers.filter((member: any) => {
            if (member.plat1 === "Main Shotcaller") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        if (mainShotcallers.length > 0) {
            mainPlat.push(mainShotcallers[0]);
            inGroup++;
            currentMembers.splice(currentMembers.findIndex(p => p.discordTag == mainShotcallers[0].discordTag), 1);
        } else {
            let backupMainCaller = currentMembers.filter((member: any) => {
                if (member.plat2 === "Main Shotcaller") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            if (backupMainCaller.length > 0) {
                mainPlat.push(backupMainCaller[0]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupMainCaller[0].discordTag), 1);
            } else {
                //TODO:Figure wtf to do here
                console.log("No Main Shotcaller has been detected");
            }
        }

        //get flex shotcallers
        let flexShotcallers = currentMembers.filter((member: any) => {
            if (member.plat1 === "Flex Shotcaller") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        if (flexShotcallers.length > 0) {
            flexPlat.push(flexShotcallers[0]);
            inGroup++;
            currentMembers.splice(currentMembers.findIndex(p => p.discordTag == flexShotcallers[0].discordTag), 1);
        } else {
            let backupFlexCaller = currentMembers.filter((member: any) => {
                if (member.plat2 === "Flex Shotcaller") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            if (backupFlexCaller.length > 0) {
                flexPlat.push(backupFlexCaller[0]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupFlexCaller[0].discordTag), 1);
            } else {
                //TODO:Figure wtf to do here
                console.log("No Flex Shotcaller has been detected");
            }
        }

        //put remaining shotcallers in respective groups
        let remainingShotcallers = currentMembers.filter((member: any) => {
            if (member.plat1 === "Main Shotcaller" || member.plat1 === "Flex Shotcaller" || member.plat1 === "Defense Shotcaller") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);
        for (let i = 0; i < remainingShotcallers.length; i++) {
            if (remainingShotcallers[i].plat1 == "Main Shotcaller") {
                mainPlat.push(remainingShotcallers[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == remainingShotcallers[i].discordTag), 1);
            } else if (remainingShotcallers[i].plat1 == "Flex Shotcaller") {
                flexPlat.push(remainingShotcallers[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == remainingShotcallers[i].discordTag), 1);
            } else if (remainingShotcallers[i].plat1 == "Flex Shotcaller") {
                flexPlat.push(remainingShotcallers[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == remainingShotcallers[i].discordTag), 1);
            }
        }


        //Setup cannons
        let cannon = currentMembers.filter((member: any) => {
            if (member.plat1 === "Cannon") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        //load primary cannons into cannon plats
        for (let i = 0; i < cannon.length && cannonPlat.length < WarStructure[nodeSize]["Cannon"]; i++) {
            cannonPlat.push(cannon[i]);
            inGroup++;
            currentMembers.splice(currentMembers.findIndex(p => p.discordTag == cannon[i].discordTag), 1);
        }
        //check if cannons are full and if not load backup
        if (cannonPlat.length < WarStructure[nodeSize]["Cannon"]) {
            let backupCannon = currentMembers.filter((member: any) => {
                if (member.plat2 === "Cannon") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            //load backup into cannons
            for (let i = 0; i < backupCannon.length && cannonPlat.length < WarStructure[nodeSize]["Cannon"]; i++) {
                cannonPlat.push(backupCannon[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupCannon[i].discordTag), 1);
            }
        }

        //Setup defense plat
        let defense = currentMembers.filter((member: any) => {
            if (member.plat1 === "Defense") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        //load primary defense team into defensePlat
        for (let i = 0; i < defense.length && defensePlat.length < WarStructure[nodeSize]["maxDefense"]; i++) {
            defensePlat.push(defense[i]);
            inGroup++;
            currentMembers.splice(currentMembers.findIndex(p => p.discordTag == defense[i].discordTag), 1);
        }
        if (defensePlat.length < WarStructure[nodeSize]["minDefense"]) {
            let backupDefense = currentMembers.filter((member: any) => {
                if (member.plat2 === "Defense") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            //load backup into defense
            for (let i = 0; i < backupDefense.length && defensePlat.length < WarStructure[nodeSize]["minDefense"]; i++) {
                defensePlat.push(backupDefense[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupDefense[i].discordTag), 1);
            }
        }

        //Setup flex plat
        let flex = currentMembers.filter((member: any) => {
            if (member.plat1 === "Flex" || member.plat1 === "Flex Shotcaller") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        //load first pass of flex team into flexPlat
        for (let i = 0; i < flex.length && (flexPlat.length + flexPlat2.length) < WarStructure[nodeSize]["minFlex"]; i++) {
            if (flexPlat.length < 20) {
                flexPlat.push(flex[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == flex[i].discordTag), 1);
            } else if (flexPlat2.length < 20) {
                flexPlat2.push(flex[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == flex[i].discordTag), 1);
            } else {
                console.log("something went wrong in flex generation", flex[i]);
            }
        }


        //Setup main plat
        let main = currentMembers.filter((member: any) => {
            if (member.plat1 === "Main" || member.plat1 === "Main Shotcaller" || member.plat1 === "DP") {
                return true;
            }
            return false;
        }).sort(this.sortGroupPriority);

        //load first pass of primary main team into mainPlat
        for (let i = 0;
            (i < main.length) && (inGroup < Number(nodeSize)) && (mainPlat.length + mainPlat2.length + mainPlat3.length + mainPlat4.length) < WarStructure[nodeSize]["minMain"]; i++) {
            if (mainPlat.length < 20) {
                mainPlat.push(main[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == main[i].discordTag), 1);
            } else if (mainPlat2.length < 20) {
                mainPlat2.push(main[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == main[i].discordTag), 1);
            } else if (mainPlat3.length < 20) {
                mainPlat3.push(main[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == main[i].discordTag), 1);
            } else if (mainPlat4.length < 20) {
                mainPlat4.push(main[i]);
                inGroup++;
                currentMembers.splice(currentMembers.findIndex(p => p.discordTag == main[i].discordTag), 1);
            } else {
                console.log("something went wrong in Main generation", flex[i]);
            }
        }

        //placeRemaining Members in primary plays
        let remainingMembers = [...currentMembers].sort(this.sortGroupPriority);
        remainingMembers.forEach((member: any) => {
            if (inGroup < Number(nodeSize)) {
                if ((member.plat1 === "Main" || member.plat1 === "Main Shotcaller") && (mainPlat.length + mainPlat2.length + mainPlat3.length + mainPlat4.length) < WarStructure[nodeSize]["maxMain"]) {
                    if (mainPlat.length < 20) {
                        mainPlat.push(member);
                        inGroup++;
                        currentMembers.splice(currentMembers.findIndex(p => p.discordTag == member.discordTag), 1);
                    } else if (mainPlat2.length < 20) {
                        mainPlat2.push(member);
                        inGroup++;
                        currentMembers.splice(currentMembers.findIndex(p => p.discordTag == member.discordTag), 1);
                    } else if (mainPlat3.length < 20) {
                        mainPlat3.push(member);
                        inGroup++;
                        currentMembers.splice(currentMembers.findIndex(p => p.discordTag == member.discordTag), 1);
                    } else if (mainPlat4.length < 20) {
                        mainPlat4.push(member);
                        inGroup++;
                        currentMembers.splice(currentMembers.findIndex(p => p.discordTag == member.discordTag), 1);
                    } else {
                        console.log("something went wrong in Main generation", member);
                    }
                } else if (member.plat1 === "Flex" || member.plat1 === "Flex Shotcaller" && (flexPlat.length + flexPlat2.length) < WarStructure[nodeSize]["Flex"]) {
                    if (flexPlat.length < 20) {
                        flexPlat.push(member);
                        inGroup++;
                        currentMembers.splice(currentMembers.findIndex(p => p.discordTag == member.discordTag), 1);
                    } else if (flexPlat2.length < 20) {
                        flexPlat2.push(member);
                        inGroup++;
                        currentMembers.splice(currentMembers.findIndex(p => p.discordTag == member.discordTag), 1);
                    } else {
                        console.log("something went wrong in Main generation", member);
                    }
                }
            }
        });

        //Backfill main and flex
        if ((inGroup < Number(nodeSize)) && (mainPlat.length + mainPlat2.length + mainPlat3.length + mainPlat4.length) < WarStructure[nodeSize]["maxMain"]) {
            let backupMain = currentMembers.filter((member: any) => {
                if (member.plat2 === "Main" || member.plat2 === "Main Shotcaller") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            //load backup into main
            for (let i = 0; i < backupMain.length && (mainPlat.length + mainPlat2.length + mainPlat3.length + mainPlat4.length) < WarStructure[nodeSize]["maxMain"]; i++) {
                if (mainPlat.length < 20) {
                    mainPlat.push(backupMain[i]);
                    inGroup++;
                    currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupMain[i].discordTag), 1);
                } else if (mainPlat2.length < 20) {
                    mainPlat2.push(backupMain[i]);
                    inGroup++;
                    currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupMain[i].discordTag), 1);
                } else if (mainPlat3.length < 20) {
                    mainPlat3.push(backupMain[i]);
                    inGroup++;
                    currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupMain[i].discordTag), 1);
                } else if (mainPlat4.length < 20) {
                    mainPlat4.push(backupMain[i]);
                    inGroup++;
                    currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupMain[i].discordTag), 1);
                } else {
                    console.log("something went wrong in Main generation", backupMain[i]);
                }
            }
        }

        //Backfill flex
        if ((inGroup < Number(nodeSize)) && (flexPlat.length + flexPlat2.length) < WarStructure[nodeSize]["Flex"]) {
            let backupFlex = currentMembers.filter((member: any) => {
                if (member.plat2 === "Flex" || member.plat2 === "Flex Shotcaller") {
                    return true;
                }
                return false;
            }).sort(this.sortGroup2Priority);
            //load backup into cannons
            for (let i = 0; i < backupFlex.length && (flexPlat.length + flexPlat2.length) < WarStructure[nodeSize]["Main"]; i++) {
                if (flexPlat.length < 20) {
                    flexPlat.push(backupFlex[i]);
                    inGroup++;
                    currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupFlex[i].discordTag), 1);
                } else if (flexPlat2.length < 20) {
                    flexPlat2.push(backupFlex[i]);
                    inGroup++;
                    currentMembers.splice(currentMembers.findIndex(p => p.discordTag == backupFlex[i].discordTag), 1);
                } else {
                    console.log("something went wrong in Main generation", backupFlex[i]);
                }
            }
        }

        //get PA groups in main
        let PAs:any[] = [];
        let mainBall:any[] = [];
        mainBall.push(...mainPlat, ...mainPlat2,...mainPlat3, ...mainPlat4);
        PAs = mainBall.filter((member:any) => {
            if(member.paPriority) {
                return true;
            } else {
                return false;
            }
        }).sort(this.sortPAPriority);

        let paGroupSize = Math.round(PAs.length / Number(paGroups));
        PAs.forEach((member:any) => {
            if(paGroup1.length < paGroupSize) {
                paGroup1.push(member);
            } else if(paGroup2.length < paGroupSize) {
                paGroup2.push(member);
            } else {
                paGroup3.push(member);
            }
        });
        
         //Generate Embed
         let fields = [];
         if(mainPlat.length) {
             fields.push({name: "Main Platoon 1", value: mainPlat.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true})
         }
         if(mainPlat2.length) {
             fields.push({name: "Main Platoon 2", value: mainPlat2.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true})
         }
         if(mainPlat3.length) {
             fields.push({name: "Main Platoon 3", value: mainPlat3.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true})
         }
         if(mainPlat4.length) {
             fields.push({name: "Main Platoon 4", value: mainPlat4.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true})
         }
         fields.push({name: '\u200B',value: '\u200B'});
         if(flexPlat.length) {
             fields.push({name: "Flex Platoon 1", value: flexPlat.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         if(flexPlat2.length) {
             fields.push({name: "Flex Platoon 2", value: flexPlat2.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         fields.push({name: '\u200B',value: '\u200B'});
         if(cannonPlat.length) {
             fields.push({name: "Cannon Platoon 1", value: cannonPlat.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         if(defensePlat.length) {
             fields.push({name: "Defense Platoon 1", value: defensePlat.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         fields.push({name: '\u200B',value: '\u200B'});
         if(paGroup1.length) {
             fields.push({name: "PA Group 1", value: paGroup1.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         if(paGroup2.length) {
             fields.push({name: "PA Group 2", value: paGroup2.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         if(paGroup3.length) {
             fields.push({name: "PA Group 3", value: paGroup3.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         fields.push({name: '\u200B',value: '\u200B'});
         if(currentMembers.length) {
            fields.push({name: "Sitting tonight.\nDM leadership why.", value: currentMembers.sort().map((member:any)=>{return member.familyName}).join("\n"),inline:true});
         }
         if(unknownUsers.length) {
             fields.push({name: "Merc or unknown name", value: unknownUsers.sort().join("\n"), inline:true});
         }

        this.message.channel.send({embed: {
            color: 0x00FF00,
            thumbnail: {
                url: 'https://i.imgur.com/XRIN9jb.png',
            },    
            title: "Party On Dudes",
            "fields": fields,
            timestamp: new Date()
        }});


    }

    sortGroupPriority(a: any, b: any) {
        if (a.groupPriority === b.groupPriority) {
            return 0
        } else {
            return (a.groupPriority < b.groupPriority) ? -1 : 1;
        }
    }

    sortGroup2Priority(a: any, b: any) {
        if (a.group2Priority === b.group2Priority) {
            return 0
        } else {
            return (a.group2Priority < b.group2Priority) ? -1 : 1;
        }
    }

    sortPAPriority(a: any, b: any) {
        if (a.paPriority === b.paPriority) {
            return 0
        } else {
            return (a.paPriority < b.group2Priority) ? -1 : 1;
        }
    }

}

export {
    PartyOn
};