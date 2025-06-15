import datas from "./datas.js"

class Moulinette{
    constructor(currentComponent, webcomponentName){
        this.currentComponent = currentComponent
        this.currentComponent._ = datas[webcomponentName] || JSON.parse(this.sanitizeInnerHTML(currentComponent)) || {}
    }

    addStyle = (styleObject) => {
        let tmp = ''
        for(let a in styleObject)
            tmp+=a+": "+styleObject[a]
        return tmp
    }
    getBasicTag = (tagName, rootComponentName, object) => {
        let elt = document.createElement(tagName)
        let elt_attr = rootComponentName ? this.currentComponent._[rootComponentName][tagName].attr : object.attr
        for (let tmp in elt_attr){
            if(typeof elt_attr[tmp] =='string')
                elt[tmp] = elt_attr[tmp]
            else if(tmp == "style")
                elt[tmp] = this.addStyle(elt_attr[tmp])
            else {

            }
        }
        elt.innerHTML = rootComponentName ? this.currentComponent._[rootComponentName][tagName].html || "" : object.html
        elt._ = rootComponentName ? this.currentComponent._[rootComponentName] : object
        return elt
    }
    getListItems = (type, items) => {
        // let selectors = this.currentComponent._[rootComponentName].behavior
        // console.log(itemsObject);
        // this.getBasicTag(tagChildName)
        switch(type){
            case"li>a":
                let $li = document.createElement('li')
                items = items.map(item=>this.getBasicTag('a', false, item))
                items = items.map(item=>{
                    let li = document.createElement('li')
                    li.appendChild(item)
                    return li
                })
                console.log(items);
            break;
            case"li":
            break;
            case"dt":
            break;
            case"details":
            break;
            default: //li behavior by default

            break;
        }
        return items
    }





    
    tag_a = (rootComponentName) => {
        let a = this.getBasicTag('a', rootComponentName)

        return a
    }
    tag_button = (rootComponentName) => {
        let button = this.getBasicTag('button', rootComponentName)
        
        return button
    }
    tag_menu = (rootComponentName) => {
        let menu = this.getBasicTag('menu', rootComponentName)
        let items = this.getListItems('li>a', menu._.menu.items)
        items.forEach(item=>{
            console.log(item);
            console.log(menu);
            menu.appendChild(item)
        })
        // let menu_seo = 
        
        // let menu = this.getImbricatedTag('menu', rootComponentName)
        return menu
    }
        






            /** RETOURNE UN TEXTE EN AYANT SUPPRIMÉ LES COMMENTAIRES PRÉSENTS DANS L'ÉLÉMENT 'currentComponent' HTML, OU DANS UN TEXTE */
            /**param:
             * currentComponent: soit un élément html, soit le contenu lu-même à filtrer */
            sanitizeInnerHTML(currentComponent){
                console.log(currentComponent);
                console.log(typeof currentComponent);
                console.log(typeof currentComponent == 'string');
                console.log(typeof currentComponent === 'string');
                let txt = typeof currentComponent === 'string' ? currentComponent : currentComponent.innerHTML
                while(txt.indexOf('<!--') != -1)
                    txt = this.eraseComments(txt)
                return txt
            }   
            eraseComments(txt){
                let a = txt.indexOf('<!--')
                let b = txt.indexOf('-->')
                txt = txt.substring(0, a)+txt.substring(b+3)
                return txt
            }
}

export default Moulinette