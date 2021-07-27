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

function getWeapon(){
    let aux_weapon = document.getElementsByClassName("weapon-icon-wrapper")[0];
    let weapon_element = aux_weapon.getElementsByClassName("trait")[0].childNodes[0].className.replace("-icon","");
    let weapon_trait1_type = aux_weapon.getElementsByClassName("stats")[0].childNodes[0].childNodes[0].className.split(" ")[2].replace("-icon","");
    let weapon_trait1_mod = aux_weapon.getElementsByClassName(weapon_trait1_type)[0].innerHTML.split("+")[1];
    let weapon = {
        "weapon_element":weapon_element,
        "weapon_trait1_type":transformWeaponTraitType(weapon_trait1_type),
        "weapon_trait1_mod":parseFloat(weapon_trait1_mod.replace(",","").replace(".","")),
        "bonus_power":0
    }
    return weapon;
}

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

function getChar(){
    let power = document.getElementsByClassName("subtext-stats")[0].childNodes[5].innerHTML;
    let char_type = document.getElementsByClassName("name bold character-name")[0].childNodes[1].className.split("-icon")[0];
    let character = {
        "power": parseFloat(power.replace(",","").replace(".","")),
        "char_type":char_type
    }
    return character
}

function getEnemies(){
    let encounters = document.getElementsByClassName("encounter-container");
    let enemies = [];
    for(i = 0; i < encounters.length; i++){
        let htmlObject = encounters[i];
        let enemy_type = htmlObject.getElementsByClassName("encounter-element")[0].childNodes[0].className.split("-icon")[0];
        let enemy_power = htmlObject.getElementsByClassName("encounter-power")[0].innerHTML.split(" ")[1];
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
    return evaluatedAttributeTotal;
}

function printProbs(enemy){
    let element = enemy.htmlObject.getElementsByClassName("victory-chance")[0];
    element.innerHTML = enemy.victory_prob.toFixed(2);
}



element = document.getElementById("prob-calc-button-extension");
if(typeof(element) == 'undefined' || element == null){
    let character_name_span = document.getElementsByClassName("character-list")[0];

    console.log("injected");

    var li = document.createElement("li");
    li.classList.add("character");
    li.innerHTML = "<button id=\"prob-calc-button-extension\" type=\"button\" class=\"btn btn btn-primary btn-small btn-secondary\">" + "Prob</button>";
    character_name_span.appendChild(li);

    document.getElementById("prob-calc-button-extension").addEventListener("click", showProbs, false);
}