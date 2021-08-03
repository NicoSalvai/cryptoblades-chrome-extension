// Main code
element = document.getElementById("prob-calc-button-extension");
if(typeof(element) == 'undefined' || element == null){
    let character_name_span = document.getElementsByClassName("character-list")[0];

    console.log("injected");

    var li = document.createElement("li");
    li.classList.add("char");
    li.innerHTML = "<button id=\"prob-calc-button-extension\" type=\"button\" class=\"btn btn btn-primary btn-small btn-secondary\" style=\"height:100%;margin-left:3px;margin-right:3px;\">" + "Prob</button>";
    character_name_span.prepend(li);

    document.getElementById("prob-calc-button-extension").addEventListener("click", showProbs, false);

    var li = document.createElement("li");
    li.classList.add("char");
    li.innerHTML = "<button id=\"exp-to-level-button-extension\" type=\"button\" class=\"btn btn btn-primary btn-small btn-secondary\" style=\"height:100%;margin-left:3px;margin-right:3px;\">" + "XP</button>";
    character_name_span.prepend(li);

    document.getElementById("exp-to-level-button-extension").addEventListener("click", showExpToLevel, false);
}



// Function to call on button click
function showProbs(){
    console.log("event showProbs");
    if(document.getElementsByClassName("encounter-container").length > 0){
        weapon = getWeapon();
        console.log(weapon);

        let character = getChar();
        console.log(character);

        let enemies = getEnemies();
        console.log(enemies);

        calculateVictoryProbability(enemies, character, weapon);

    }
}

// Get weapon information/stats
function getWeapon(){
    let aux_weapon = document.getElementsByClassName("weapon-icon-wrapper")[0];
    let weapon_element = aux_weapon.getElementsByClassName("trait")[0].childNodes[0].className.replace("-icon","");

    let bonus_power_aux = aux_weapon.getElementsByClassName("bonus-power")[0].childNodes[0];
    let PB = "0";
    if(bonus_power_aux.hasChildNodes()){
        if(bonus_power_aux.childNodes[0].innerHTML.split(" ")[1] == "LB"){
            PB = bonus_power_aux.childNodes[0].innerHTML.split(" ")[0];
        }
    }
    
    let weapon_trait1_type = aux_weapon.getElementsByClassName("stats")[0].childNodes[0].childNodes[0].className.split(" ")[2].replace("-icon","");
    let weapon_trait1_mod = aux_weapon.getElementsByClassName("stats")[0].childNodes[0].childNodes[1].innerHTML.split("+")[1];
    
    let weapon_trait2_type = "none";
    let weapon_trait2_mod = "0";
    if(aux_weapon.getElementsByClassName("stats")[0].childNodes[1].hasChildNodes()){
        weapon_trait2_type = aux_weapon.getElementsByClassName("stats")[0].childNodes[1].childNodes[0].className.split(" ")[2].replace("-icon","");
        weapon_trait2_mod = aux_weapon.getElementsByClassName("stats")[0].childNodes[1].childNodes[1].innerHTML.split("+")[1];
    }

    let weapon_trait3_type = "none";
    let weapon_trait3_mod = "0";
    if(aux_weapon.getElementsByClassName("stats")[0].childNodes[2].hasChildNodes()){
        weapon_trait3_type = aux_weapon.getElementsByClassName("stats")[0].childNodes[2].childNodes[0].className.split(" ")[2].replace("-icon","");
        weapon_trait3_mod = aux_weapon.getElementsByClassName("stats")[0].childNodes[2].childNodes[1].innerHTML.split("+")[1];
    }

    let weapon = {
        "weapon_element":weapon_element,
        "weapon_trait1_type":transformWeaponTraitType(weapon_trait1_type),
        "weapon_trait1_mod":parseFloat(weapon_trait1_mod.replace(",","").replace(".","")),
        "weapon_trait2_type":transformWeaponTraitType(weapon_trait2_type),
        "weapon_trait2_mod":parseFloat(weapon_trait2_mod.replace(",","").replace(".","")),
        "weapon_trait3_type":transformWeaponTraitType(weapon_trait3_type),
        "weapon_trait3_mod":parseFloat(weapon_trait3_mod.replace(",","").replace(".","")),
        "bonus_power":(parseFloat(PB)*15)
    }
    return weapon;
}


// transform weapon trait from short to real type
function transformWeaponTraitType(weapon_trait1_type){
    switch(weapon_trait1_type){
        case "cha":
            weapon_trait1_type = "lightning";
            break;
        case "int":
            weapon_trait1_type = "water";
            break;
        case "dex":
            weapon_trait1_type = "earth";
            break;
        case "str":
            weapon_trait1_type = "fire";
            break;
    }
    return weapon_trait1_type;
}


// Get character information
function getChar(){
    let power = document.getElementsByClassName("subtext-stats")[0].childNodes[5].innerHTML;
    let char_type = document.getElementsByClassName("name bold character-name")[0].childNodes[1].className.split("-icon")[0];
    let character = {
        "power": parseFloat(power.replace(",","").replace(".","")),
        "char_type":char_type
    }
    return character
}


// Get enemies information
function getEnemies(){
    let encounters = document.getElementsByClassName("encounter-container");
    let enemies = [];
    for(i = 0; i < encounters.length; i++){
        let htmlObject = encounters[i];
        let enemy_type = htmlObject.getElementsByClassName("encounter-element")[0].childNodes[0].className.split("-icon")[0];
        let enemy_power = htmlObject.getElementsByClassName("encounter-power")[0].innerHTML.split(" ")[0];
        let enemy = {
            "enemy_type":enemy_type,
            "enemy_power":parseFloat(enemy_power.replace(",","").replace(".","")),
            "victory_prob":0,
            "htmlObject":htmlObject
        }
        enemies.push(enemy)
    }
    return enemies;
}

function calculateVictoryProbability(enemies, character, weapon){
    for(i = 0; i < enemies.length; i++){
        calculateProbs(enemies[i], character, weapon);
        printProbs(enemies[i]);
    }
}

function calculateProbs(enemy, character, weapon){
    let evaluatedAttributeTotal = calculateEvaluatedAttributeTotal(character.char_type,weapon);
    let alignedPower = ((evaluatedAttributeTotal+1)*character.power)+weapon.bonus_power;
    console.log(weapon.bonus_power);

    let final_power = alignedPower;
    if(character.char_type == weapon.weapon_element){
        final_power += final_power*0.075;
    }
    if(checkTypeAdvantaje(character.char_type,enemy.enemy_type)){
        final_power += final_power*0.075;
    }
    if(checkTypeAdvantaje(enemy.enemy_type,character.char_type)){
        final_power -= final_power*0.075;
    }
   
    let enemy_max = enemy.enemy_power*1.1;
    let enemy_min = enemy.enemy_power*0.9;
    let char_max = final_power*1.1;
    let char_min = final_power*0.9;

    let rango = enemy_max - char_min;
    if(rango < 0)
        rango = 0;
    
    let prob_e = rango/(enemy_max-enemy_min);
    let prob_c = rango/(char_max-char_min);
    let  prob3 = (prob_e * prob_c) / 2;
    let temp = 1 - (prob_e * prob_c);

    let probVictoria = (temp + prob3) * 100;
    
    enemy.victory_prob = probVictoria;
}

function checkTypeAdvantaje(char_type,enemy_type){
    switch(char_type){
        case "lightning":
            if(enemy_type == "water"){
                return true;
            }
            return false;
            break;
        case "water":
            if(enemy_type == "fire"){
                return true;
            }
            return false;
            break;
        case "earth":
            if(enemy_type == "lightning"){
                return true;
            }
            return false;
            break;
        case "fire":
            if(enemy_type == "earth"){
                return true;
            }
            return false;
            break;
    }
}

function calculateEvaluatedAttributeTotal(char_type, weapon){
    let evaluatedAttributeTotal = 0;
    switch(weapon.weapon_trait1_type){
        case "pwr":
            evaluatedAttributeTotal += weapon.weapon_trait1_mod * 0.002575;
            break;
        case char_type:
            evaluatedAttributeTotal += weapon.weapon_trait1_mod * 0.002675;
            break;
        default:
            evaluatedAttributeTotal += weapon.weapon_trait1_mod * 0.0025;
            break;
    }
    switch(weapon.weapon_trait2_type){
        case "pwr":
            evaluatedAttributeTotal += weapon.weapon_trait2_mod * 0.002575;
            break;
        case char_type:
            evaluatedAttributeTotal += weapon.weapon_trait2_mod * 0.002675;
            break;
        case "none":
            break;
        default:
            evaluatedAttributeTotal += weapon.weapon_trait2_mod * 0.0025;
            break;
    }
    switch(weapon.weapon_trait3_type){
        case "pwr":
            evaluatedAttributeTotal += weapon.weapon_trait3_mod * 0.002575;
            break;
        case char_type:
            evaluatedAttributeTotal += weapon.weapon_trait3_mod * 0.002675;
            break;
        case "none":
            break;
        default:
            evaluatedAttributeTotal += weapon.weapon_trait3_mod * 0.0025;
            break;
    }
    return evaluatedAttributeTotal;
}

function printProbs(enemy){
    let element = enemy.htmlObject.getElementsByClassName("victory-chance")[0];
    element.innerHTML = enemy.victory_prob.toFixed(2);
}



function showExpToLevel(){
    console.log("event showExpToLevel");
    if(document.getElementsByClassName("character-list").length > 0){
        let characters = getReducedCharacters();
        printXps(characters);
        console.log(characters);
    }   
}


function getReducedCharacters(){
    let charactersDOM = document.getElementsByClassName('character-list')[0].getElementsByClassName('character');
    let charactersDOMHL = document.getElementsByClassName('character-list')[0].getElementsByClassName('character-highlight');
    let xp_to_claim_list_htmlobject = document.getElementsByTagName('u');
    let characters = []
    for(i = 0; i < charactersDOM.length; i++){
        let level = parseInt(charactersDOM[i].getElementsByClassName('name-list')[0].innerHTML.split('Lv.')[1]);
        let next_milestone_level = getNextLevelMilestone(level);
        let xp_to_level = getXpToLevel(level, next_milestone_level);
        let name = charactersDOM[i].getElementsByClassName('name-list')[0].innerHTML.split(' Lv.')[0].trim();
        let xp_to_claim = parseInt(getXpToClainForCharName(name,xp_to_claim_list_htmlobject))
        let xp_needed = xp_to_level - xp_to_claim;
        if(xp_needed < 0){
            xp_needed = 0;
        }
        let character = {
            "name": name,
            "xp_to_claim":xp_to_claim,
            "level":level,
            "next_milestone_level": next_milestone_level,
            "xp_to_level": xp_to_level,
            "xp_needed": xp_needed,
            "htmlObject": charactersDOM[i]
        }
        characters.push(character);
    }

    for(i = 0; i < charactersDOMHL.length; i++){
        let level = parseInt(charactersDOMHL[i].getElementsByClassName('name-list')[0].innerHTML.split('Lv.')[1]);
        let next_milestone_level = getNextLevelMilestone(level);
        let xp_to_level = getXpToLevel(level, next_milestone_level);
        let name = charactersDOMHL[i].getElementsByClassName('name-list')[0].innerHTML.split(' Lv.')[0].trim();
        let xp_to_claim = parseInt(getXpToClainForCharName(name,xp_to_claim_list_htmlobject))
        let xp_needed = xp_to_level - xp_to_claim;
        if(xp_needed < 0){
            xp_needed = 0;
        }
        let character = {
            "name": name,
            "xp_to_claim":xp_to_claim,
            "level":level,
            "next_milestone_level": next_milestone_level,
            "xp_to_level": xp_to_level,
            "xp_needed": xp_needed,
            "htmlObject": charactersDOMHL[i]
        }
        characters.push(character);
    }
    
    return characters;
}

function getXpToClainForCharName(char_name, xp_to_claim_list_htmlobject){
    for(k = 0; k < xp_to_claim_list_htmlobject.length; k++){
        if(xp_to_claim_list_htmlobject[k].innerHTML.includes(char_name)){
            return xp_to_claim_list_htmlobject[k].innerHTML.split(" ")[2];
        }
    }
}

function getNextLevelMilestone(current_level){
    return (parseInt((parseInt(current_level)/10) + "")*10)+11;
}

function getXpToLevel(current_level, level_to){
    let xp_to_level_const = [16,17,18,19,20,22,24,26,28,30,33,36,39,42,46,50,55,60,66,72,79,86,94,103,113,124,136,149,163,178,194,211,229,248,268,289,311,334,358,383,409,436,464,493,523,554,586,619,653,688,724,761,799,838,878,919,961,1004,1048,1093,1139,1186,1234,1283,1333,1384,1436,1489,1543,1598,1654,1711,1769,1828,1888,1949,2011,2074,2138,2203,2269,2336,2404,2473,2543,2614,2686,2759,2833,2908,2984,3061,3139,3218,3298,3379,3461,3544,3628,3713,3799,3886,3974,4063,4153,4244,4336,4429,4523,4618,4714,4811,4909,5008,5108,5209,5311,5414,5518,5729,5836,5944,6053,6163,6274,6386,6499,6613,6728,6844,6961,7079,7198,7318,7439,7561,7684,7808,7933,8059,8186,8314,8443,8573,8704,8836,8969,9103,9374,9511,9649,9788,9928,10069,10211,10354,10498,10643,10789,10936,11084,11233,11383,11534,11686,11839,11993,12148,12304,12461,12619,12778,12938,13099,13261,13424,13588,13919,14086,14254,14423,14593,14764,14936,15109,15283,15458,15634,15811,15989,16168,16348,16529,16711,16894,17078,17263,17449,17636,17824,18013,18203,18394,18586,18779,18973,19364,19561,19759,19958,20158,20359,20561,20764,20968,21173,21379,21586,21794,22003,22213,22424,22636,22849,23063,23278,23494,23711,23929,24148,24368,24589,24811,25034,25258,25709,25936,26164,26393,26623,26854,27086,27319,27553,27788,28024,28261,28499,28738]
    let accum = 0;
    for(j = current_level; j < level_to; j++){
        accum+=xp_to_level_const[j-1];
    }
    return accum;
}

function printXps(characters){
    for(j = 0; j < characters.length; j++){
        let element = characters[j].htmlObject.getElementsByClassName("name-list")[0];
        if(element.innerHTML.includes("<br>")){
            element.innerHTML = element.innerHTML.split("<br>")[0];
        } else {
        element.innerHTML += "<br>XP to level " + characters[j].next_milestone_level + ": " + characters[j].xp_to_level +
        "<br>Claim XP in " + characters[j].next_milestone_level + ": " + ((characters[j].xp_needed/29.5)/7).toFixed(1) + " Days";
        }
    }
}