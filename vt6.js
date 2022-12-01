"use strict";

/* globals ReactDOM: false */
/* globals React: false */
/* globals data: false */
const App = function(props) {
    // Käytetään lähes samaa dataa kuin viikkotehtävässä 1
    // Alustetaan tämän komponentin tilaksi data.
    // Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
    // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi
    // kopioimista varten on annettu valmis mallifunktio kopioi_kilpailu
    // huom. kaikissa tilanteissa ei kannata kopioida koko dataa
    const [state, setState] = React.useState({"kilpailu": kopioi_kilpailu(data) });
    console.log( state.kilpailu );

    /**
     * Lisää joukkueen App:n stateen
     * lisattyJoukkue on seuraavankaltainen objekti:
     * {
     *  "nimi": ei-tyhjä-nimi,
     *  "leimaustapa": [] (vähintään tyhjä array),
     *  "sarja": pakollinen-valittu-sarja,
     *  "jasenet": [jäsen1, jäsen2, ...] (vähintään 2 jäsentä)
     * }
     * @param {Object} lisattyJoukkue 
     */
    let lisaaJoukkue = function(lisattyJoukkue) {
        // lisättyJoukkue lisätään uniikki id ja tyhjä rastileimaus[]
        // päivittää staten lisäämällä uuden joukkueen
        // ^ pitää luultavasti päivittää vain state.kilpailu.joukkueet
        // ^ tee oma funktio kopioi_kilpailu_shallow_paitsi_joukkueet...?
        console.log("App sanoo: ", lisattyJoukkue);
    };

    /* jshint ignore:start */
    return (
        <div>
            <LisaaJoukkue lisaaJoukkue={lisaaJoukkue} kilpailu={state.kilpailu}/>
            <ListaaJoukkueet />
        </div>
    );
    /* jshint ignore:end */
};


/** TODO: validityt, jäsenet, lisäyksen jälkeen formin tyhjennys
 * Propseissa:
 * .lisaaJoukkue (funktio, jolla joukkue lisätään Appin stateen)
 * .kilpailu (Appin statesta sen hetkinen kilpailu ~= data)
 * @param {Object} props 
 * @returns JSX-muodossa form joukkueen lisäämiselle
 */
const LisaaJoukkue = function(props) {
    // tehdään leimaustavoista oma listansa, jossa jokaisella leimaustavalla on
    // aluksi selected: false ja id:index

    let leimaustavat = Array.from(props.kilpailu.leimaustavat);

    const [state, setState] = React.useState(
        {
            "nimi": "",
            "leimaustapa": [],
            "sarja": props.kilpailu.sarjat[0].id,
            "jasenet": []
        }
    );

    /**
     * Jos joukkueen tiedoissa tai jäsenissä tulee muutosta
     * kutsutaan tätä (kertomalla mitä kohtaa muutetaan)
     * Nimi ja sarja muutetaan suoraan, koska niillä yksikäsitteinen arvo
     * Leimaustapalista muutetaan erillisellä listaan perehtyneellä changella
     * Jäsenet muutetaan toisella listaan perehtyneellä changella
     * @param {String} kohta "nimi", "sarja", "leimaustapa" tai "jasenet"
     * @param {String} sisalto 
     */
    let valitseHandle = function(kohta, sisalto) {
        if (kohta == "nimi" || kohta == "sarja") {
            handleChange(kohta, sisalto);
        } else if (kohta == "leimaustapa") {
            muokkaaCheckboxChange(kohta, sisalto);
        } else if (kohta == "jasenet") {

        }
    };

    let handleChange = function(kohta, sisalto) {
        let uusistate = {...state};
        uusistate[kohta] = sisalto;
        setState(uusistate);
    };

    let muutaInputinSisaltoa2 = function(kohta, event) {
        console.log(kohta);
        let objekti = event;
        let type = objekti.type;
        let newstate = {...state};
        if (type == "checkbox") {
            newstate[kohta] = Array.from(state[kohta]);
            if (objekti.checked) {
                newstate[kohta].push(objekti.previousSibling.textContent);
            }
        } else {
            newstate[kohta].splice(newstate[kohta].indexOf(objekti.previousSibling.textContent), 1);
        }
        setState(newstate);
    };

    /**
     * Muokkaa listatyylisen input-kokoelman 
     * @param {String} kohta 
     * @param {*} sisalto 
     */
    let muokkaaCheckboxChange = function(kohta,sisalto) {
        let items = Array.from(state[kohta]);
        for (let item of items) {
            if (item.id == sisalto) {
                if (item.selected) {
                    item.selected = false;
                } else {
                    item.selected = true;
                }
                break;
            }
        }

        handleChange(kohta, items);
    };

    /**
     * Hoitaa lisäysnapin painalluksen jälkeisen toiminnan:
     * - luo uuden joukkueen
     * - lisää siihen täydennetyt tiedot
     * - tyhjentää staten alkutilanteeseen
     * - kutsuu App:n lisaaJoukkue-funktiota
     * @param {Event} event 
     */
    let handleLisaa = function(event) {
        // uusiJoukkue sisältöineen
        event.preventDefault();
        let uusiJoukkue = {...state};
        uusiJoukkue.sarja = etsiSarjaIdnPerusteella(uusiJoukkue.sarja, props.kilpailu.sarjat);

        let palautettavatLeimaukset = [];
        leimaustavat.map((item, index) => {
            if (uusiJoukkue.leimaustapa.includes(item)) {
                palautettavatLeimaukset.push(index);
            }
        });
        uusiJoukkue.leimaustapa = palautettavatLeimaukset;

        let tyhjaJoukkue = {
            "nimi": "",
            "leimaustapa": [],
            "sarja": props.kilpailu.sarjat[0].id,
            "jasenet": []
        };
        setState(tyhjaJoukkue);
        props.lisaaJoukkue(uusiJoukkue);
    };

    /* jshint ignore:start */
    return (
        <form>
            <JoukkueenTiedot
                change={valitseHandle}
                sarjat={props.kilpailu.sarjat}
                selectedSarja={state.sarja}
                leimaustavat={leimaustavat}
                change2={muutaInputinSisaltoa2}
                checkedCheckboxes={state.leimaustapa} />
            <Jasenet />
            <button onClick={handleLisaa}>Tallenna</button>
        </form>);
    /* jshint ignore:end */
};


/**
 * JoukkueenTiedot pitää omaa statea, jossa on:
 * - inputtien tiedot (nimi, mitkä leimaustavat, sarjat)
 */
const JoukkueenTiedot = function JoukkueenTiedot(props) {

    let sarjat = Array.from(props.sarjat);
    sarjat.sort(aakkosjarjestysNimenMukaan);

    let leimaustavat = Array.from(props.leimaustavat).sort();

    let muutaNimea = function(event) {
        let validity = event.target.validity;
        if (validity.badInput || validity.patternMismatch || validity.rangeOverflow || validity.rangeUnderflow || validity.tooLong || validity.tooShort || validity.typeMismatch || validity.valueMissing || !event.target.value.trim()) {
            event.target.setCustomValidity("Vähintään yksi merkki (ei välilyönti)");
        } else {
            event.target.setCustomValidity("");
        }
        props.change("nimi", event.target.value);
    };

    let muutaInputinSisaltoa = function(kohta, sisalto) {
        props.change(kohta, sisalto);
    };

    let muutaInputinSisaltoa2 = function(kohta, event) {
        props.change2(kohta, event);
    };

    /* jshint ignore:start */
    return (
        <fieldset>
            <legend>Joukkueen tiedot</legend>
            <label>Nimi
                <input type="text" required="required" onChange={muutaNimea} />
            </label>
            <div className="leimaustavat-kokonaisuus">
                <label>Leimaustavat</label>
                <InputListaAAAAAA name="leimaustapa" change={muutaInputinSisaltoa2} items={leimaustavat} type="checkbox" checked={props.checkedCheckboxes}/>
            </div>
            <div className="sarjat-kokonaisuus">
                <label>Sarjat</label>
                <InputLista name="sarja" change={muutaInputinSisaltoa} type="radio" items={sarjat} selected={props.selectedSarja} />
            </div>

        </fieldset>
    )
    /* jshint ignore:end */
};


/**
 * InputLista ei pidä omaa statea vaan palauttelee JoukkueenTiedot:lle
 */
const InputLista = React.memo(function InputLista(props) {
    /* jshint ignore:start */
    let muutaSisaltoa = function (event) {
        props.change(props.name, event.target.id);
    }

    let listaus = [];
    for (let item of props.items) {
        let rivi;
        if (item.selected || item.id == props.selected) {
            rivi = (
                <label className="nimi-inputilla" key={item.id}>
                    {item.nimi}
                    <input type={props.type} name={props.name} id={item.id} checked={item.selected} onChange={muutaSisaltoa} />
                </label>
            )
        } else {
            rivi = (
                <label className="nimi-inputilla" key={item.id}>
                    {item.nimi}
                    <input type={props.type} name={props.name} id={item.id} onChange={muutaSisaltoa} />
                </label>
                )
        }
        listaus.push(rivi);
    }

    return (
        <span>
            <div>
                {listaus}
            </div>
        </span>
    );
    /* jshint ignore:end */
});

/**
 * InputLista ei pidä omaa statea vaan palauttelee JoukkueenTiedot:lle
 */
 const InputListaAAAAAA = React.memo(function InputLista(props) {
    /* jshint ignore:start */
    let muutaSisaltoa = function (event) {
        props.change(props.name, event.target);
    }

    let listaus = [];
    let i = 0;
    for (let item of props.items) {
        let rivi = (
            <label className="nimi-inputilla" key={i}>
                {item}
                <input
                    type={props.type}
                    name={props.name}
                    onChange={muutaSisaltoa}
                    checked={props.checked.includes(item)}
                />
            </label>
        );
        i++;
        listaus.push(rivi);
    }

    return (
        <span>
            <div>
                {listaus}
            </div>
        </span>
    );
    /* jshint ignore:end */
});

const Jasenet = React.memo(function Jasenet(props) {
    /* jshint ignore:start */
    return (
    <fieldset>
        <legend>Jäsenet</legend>
        <label>Jäsen 1
            <input type="text" />
        </label>
        <label>Jäsen 2
            <input type="text" />
        </label>
        <label>Jäsen 3
            <input type="text" />
        </label>
        <label>Jäsen 4
            <input type="text" />
        </label>
    </fieldset>
        
    );
    /* jshint ignore:end */
});

const ListaaJoukkueet = function(props) {
    /* jshint ignore:start */
    return (
        <table>
        </table>);
    /* jshint ignore:end */
};


const root = ReactDOM.createRoot( document.getElementById('root'));
root.render(
    /* jshint ignore:start */
    <React.StrictMode>
        <App />
    </React.StrictMode>
    /* jshint ignore:end */
);


// datarakenteen kopioiminen
// joukkueen leimausten rasti on viite rastitaulukon rasteihin
// joukkueen sarja on viite sarjataulukon sarjaan
function kopioi_kilpailu(data) {
    let kilpailu = {};
    kilpailu.nimi = data.nimi;
    kilpailu.loppuaika = data.loppuaika;
    kilpailu.alkuaika = data.alkuaika;
    kilpailu.kesto = data.kesto;
    kilpailu.leimaustavat = Array.from( data.leimaustavat );

    let uudet_rastit = new Map(); // tehdään uusille rasteille jemma, josta niiden viitteet on helppo kopioida
    function kopioi_rastit(j) {
        let uusir = {};
        uusir.id = j.id;
        uusir.koodi = j.koodi;
        uusir.lat = j.lat;
        uusir.lon = j.lon;
        uudet_rastit.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
        return uusir; 
    }

    kilpailu.rastit = Array.from( data.rastit, kopioi_rastit );
    let uudet_sarjat = new Map(); // tehdään uusille sarjoille jemma, josta niiden viitteet on helppo kopioida
    function kopioi_sarjat(j) {
        let uusir = {};
        uusir.id = j.id;
        uusir.nimi = j.nimi;
        uusir.kesto = j.kesto;
        uusir.loppuaika = j.loppuaika;
        uusir.alkuaika = j.alkuaika;
        uudet_sarjat.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
        return uusir; 
    }

    kilpailu.sarjat = Array.from( data.sarjat, kopioi_sarjat );
    function kopioi_joukkue(j) {
        let uusij = {};
        uusij.nimi = j.nimi;
        uusij.id = j.id;
        uusij.sarja = uudet_sarjat.get(j.sarja);

        uusij["jasenet"] = Array.from( j["jasenet"] );
        function kopioi_leimaukset(j) {
            let uusir = {};
            uusir.aika = j.aika;
            uusir.rasti = uudet_rastit.get(j.rasti); // haetaan vanhaa rastia vastaavan uuden rastin viite
            return uusir;
        }
        uusij["rastileimaukset"] = Array.from( j["rastileimaukset"], kopioi_leimaukset );
        uusij["leimaustapa"] = Array.from( j["leimaustapa"] );
        return uusij;
    }

    kilpailu.joukkueet = Array.from( data.joukkueet, kopioi_joukkue);
    return kilpailu;
}

/**
 * Sorting-funktion apufunktio
 * Ottaa kaksi objektia, joilla on kenttä "nimi"
 * @param {Object} a 
 * @param {Object} b 
 * @returns 
 */
function aakkosjarjestysNimenMukaan(a,b) {
    if (a.nimi < b.nimi) {
        return -1;
    } else if (b.nimi < a.nimi) {
        return 1;
    }
    return 0;
}

/**
 * Etsii sarjan id-numeron perusteella.
 * Id on annettu merkkijonona
 * @param {String} id 
 * @return sarja-objekti
 */
function etsiSarjaIdnPerusteella(id, sarjat) {
    for (let sarja of sarjat) {
        if (sarja.id == id) {
            return sarja;
        }
    }
}