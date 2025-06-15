const datas = {
    navbar: {
        "block": {"expand": "md", "mode": "dark"},
        /*
        "types": {
            "expand": ["never", "always", "sm", "md", "lg", "xl", "xxl"],
            "mode": ["dark", "light"]
        },
        "type_default": ["md", "dark"],
        */
        "logo": {
            "behavior": "basic",
            "types": {"basic": "a", "seo": "h1>(a>img)+a>em"},
            "type_default": "basic",
            "attr": {
                "monattr": "mavaleurdattribut",
                "style": {"string": "of", "css": "rules"},
            },
            "a": {
                "html": "dark", 
                "attr": {"title": "titre par défault", "href": "#"}
            }
        },
        "collapse": {
            "types": {"void": "aucun type possible, le collapse est un élément présent par défaut, il dépend de la valeur 'type.expand' du composant"},
            "style": {"string": "of", "css": "rules"},
            "attr": {"monattr": "mavaleurdattribut"},
            "button": {
                "attr": {"type": "button", "data-toggle": "collapse", "data-target": "navbarID"},
                "event": {
                    "clic": "ok"
                }
            }
        },
        "menu_main": {
            "behavior": "seo",
            "types": {"basic": "li>a", "icon": "li>a>i", "seo": "li>a>img+em"},
            "type_default": "basic",
            "menu":{
                "attr": {
                    "id": "mynavbarmenu",
                    "style": {"string": "of", "css": "rules"},
                },
                "items": [
                    {
                        "behavior": "button",
                        "types": ["dropdown", "button"],
                        "html": "Home", 
                        "attr": {"href": "#", "class": "active"},
                        "event": {
                            "mouseover": "alert('mouseover')"
                        }
                    },
                    {
                        "types": ["dropdown", "button"],
                        "html": "Menu-1", 
                        "attr": {"href": "#"},
                        "event": {
                            "mouseout": "alert('mmmouseout')"
                        }
                    },
                    {
                        "html": "Menu-2", 
                        "attr": {"href": "#"},
                        "event": {
                            "focus": "alert('focus')"
                        }
                    },
                    {
                        "html": "Menu-3", 
                        "attr": {"href": "#"},
                        "event": {
                            "clic": "ok"
                        }
                    },
                    {
                        "behavior": "dropdown",
                        "html": "dropdown-0", 
                        "attr": {"href": "#"},
                        "event": {
                            "clic": "ok"
                        }
                    },
                    {
                        "behavior": "dropdown",
                        "html": "dropdown-1", 
                        "attr": {"href": "#"},
                        "event": {
                            "clic": "ok"
                        }
                    }
                ]
            }
        },
        "menu_account": {
            "behavior": "basic",
            "types": {"basic": "button+ul>li>a", "img": "img+ul>li>a"},
            "type_default": "basic",
            "attr": {
                "monattr": "mavaleurdattribut",
                "style": {"string": "of", "css": "rules"},
            },
            "items": [
                {
                    "html": "sousmenu 1", 
                    "attr": {"href": "#"}
                },
                {
                    "html": "sousmenu 2", 
                    "attr": {"href": "#"}
                },
                {
                    "html": "sousmenu 3", 
                    "attr": {"href": "#"}
                }
            ]
        },
        "form": {
            "behavior": "basic",
            "types": {"basic": "form>input", "search": "", "login": ""},
            "type_default": "basic",
            "attr": {
                "monattr": "mavaleurdattribut",
                "style": {"string": "of", "css": "rules"},
            },
            "input": {
                "attr": {"placeholder": "search...."}
            }
        }
    }
}

export default datas