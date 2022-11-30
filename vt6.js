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


/**
 * Propseissa:
 * .lisaaJoukkue (funktio, jolla joukkue lisätään Appin stateen)
 * .kilpailu (Appin statesta sen hetkinen kilpailu ~= data)
 * @param {Object} props 
 * @returns JSX-muodossa form joukkueen lisäämiselle
 */
const LisaaJoukkue = function(props) {
    // tehdään leimaustavoista oma listansa, jossa jokaisella leimaustavalla on
    // aluksi selected: false ja id:index
    let leimaustavat = [];
    Array.from(props.kilpailu.leimaustavat).map((item, index) => {
        leimaustavat.push({"id": index, "nimi": item, "selected": false});
    });

    const [state, setState] = React.useState(
        {
            "nimi": "",
            "leimaustapa": leimaustavat,
            "sarja": props.kilpailu.sarjat[0].id,
            "jasenet": []
        }
    );

    /**
     * Jos joukkueen tiedoissa tai jäsenissä tulee muutosta
     * kutsutaan tätä (kertomalla mitä kohtaa muutetaan)
     * Jos kyseessä on nimi tai sarja,
     * tämä funktio hoitaa sen itse
     * Jos täytyy kajota listoihin, kutsutaan muokkaaListaChange 
     * samoilla parametreilla
     * @param {String} kohta 
     * @param {String} sisalto 
     */
    let handleChange = function(kohta, sisalto) {
        if (kohta == "nimi" || kohta == "sarja") {
            let uusistate = {...state};
            uusistate[kohta] = sisalto;
            setState(uusistate);
        } else {
             muokkaaListaChange(kohta, sisalto);
        }
    };

    let muokkaaListaChange = function(kohta,sisalto) {
        let uusistate = {...state};
        let items = uusistate[kohta];
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

        console.log(items, sisalto);
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

        leimaustavat.forEach((leima) => leima.selected = false);
        let tyhjaJoukkue = {
            "nimi": "",
            "leimaustapa": leimaustavat,
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
                change={handleChange}
                leimaustavat={leimaustavat}
                selectedLeimaustavat={state.leimaustapa}
                sarjat={props.kilpailu.sarjat}
                selectedSarja={state.sarja} />
            <Jasenet />
            <button onClick={handleLisaa}>Tallenna</button>
        </form>);
    /* jshint ignore:end */
};


/**
 * JoukkueenTiedot pitää omaa statea, jossa on:
 * - inputtien tiedot (nimi, mitkä leimaustavat, sarjat)
 */
const JoukkueenTiedot = React.memo(function JoukkueenTiedot(props) {

    let sarjat = Array.from(props.sarjat);
    sarjat.sort(aakkosjarjestysNimenMukaan);

    let leimaustavat = Array.from(props.leimaustavat);
    leimaustavat.sort(aakkosjarjestysNimenMukaan);

    let muutaCheckboxia = function(event) {
        props.change("leimaustapa", event.target.id);
    };

    let muutaRadiota = function(event) {
        props.change("sarja", event.target.id);
    };

    let muutaNimea = function(event) {
        props.change("nimi", event.target.value);
    };

    let muutaInputinSisaltoa = function(kohta, sisalto) {
        props.change(kohta, sisalto);
    }

    /* jshint ignore:start */
    return (
        <fieldset>
            <legend>Joukkueen tiedot</legend>
            <label>Nimi
                <input type="text" onChange={muutaNimea}></input>
            </label>
            <div className="leimaustavat-kokonaisuus">
                <label>Leimaustavat</label>
                <span>
                    <div onChange={muutaCheckboxia}>
                    {leimaustavat.map(function(item, index) {
                        return <label className="nimi-inputilla" key={index}>
                            {item.nimi}
                                <input type="checkbox" name="leimaustapa" id={item.id}/>
                        </label>
                    })}
                    </div>
                </span>
                <InputLista name="leimaustapa" change={muutaCheckboxia} type="checkbox" items={leimaustavat} />
            </div>
            <div className="sarjat-kokonaisuus">
                <label>Sarjat</label>
                <span>
                <div onChange={muutaRadiota}>
                    {sarjat.map(function(item) {
                        if (item.id == props.selectedSarja) {
                            return <label className="nimi-inputilla" key={item.id}>{item.nimi}
                                <input type="radio" name="sarjaradio" defaultChecked="checked" id={item.id} />
                            </label>
                        }
                        return <label className="nimi-inputilla" key={item.id}> 
                            {item.nimi}
                            <input type="radio" name="sarjaradio" id={item.id}/>
                        </label>
                        })
                    }
                </div>
                </span>
                <InputLista name="sarja" change={muutaRadiota} type="radio" items={sarjat} selected={props.selectedSarja} />
            </div>
        </fieldset>
    )
    /* jshint ignore:end */
});


const InputLista = React.memo(function InputLista(props) {
    /* jshint ignore:start */
    let muutaSisaltoa = function (event) {
        props.change(props.name, event.target.id);
    }

    return (
        <span>
            <div onChange={muutaSisaltoa}>
            {props.items.map(function(item) {
                if (item.id == props.selected) {
                    return <label className="nimi-inputilla" key={item.id}>
                    {item.nimi}
                    <input type={props.type} name={props.name} id={item.id} defaultChecked="checked"/>
                </label>
                }
                return <label className="nimi-inputilla" key={item.id}>
                    {item.nimi}
                    <input type={props.type} name={props.name} id={item.id}/>
                </label>
            })}
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