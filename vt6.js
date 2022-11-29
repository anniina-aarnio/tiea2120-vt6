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
        console.log(lisattyJoukkue);
    };

    /* jshint ignore:start */
    return (
        <div>
            <LisaaJoukkue lisaaJoukkue={lisaaJoukkue} />
            <ListaaJoukkueet />
        </div>
    );
    /* jshint ignore:end */
};

const LisaaJoukkue = function(props) {
    const [state, setState] = React.useState(
        {
            "nimi": "",
            "leimaustapa": [],
            "sarja": props.sarjat[0].id,
            "jasenet": []
        }
    );

    let handleChange = function(kohta, sisalto) {
        let uusistate = {...state};
        uusistate[kohta] = sisalto;
        setState(uusistate);
    };

    let handleLisaa = function(event) {
        // uusiJoukkue sisältöineen
        event.preventDefault();
        let uusiJoukkue = {...state};
        console.log(uusiJoukkue);
        let tyhjaJoukkue = {
            "nimi": "",
            "leimaustapa": [],
            "sarja": props.sarjat[0].id,
            "jasenet": []
        };
        setState(tyhjaJoukkue);
        props.lisaaJoukkue(uusiJoukkue);
    };
    /* jshint ignore:start */
    return (
        <form>
            <JoukkueenTiedot change={handleChange} />
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

    /* jshint ignore:start */
    return (
        <fieldset>
            <legend>Joukkueen tiedot</legend>
            <label>Nimi
                <input type="text"></input>
            </label>
            <div className="leimaustavat-kokonaisuus">
                <label>Leimaustavat</label>
                <span>
                    <label className="nimi-inputilla">Lomake
                        <input type="checkbox" />
                    </label>
                    <label className="nimi-inputilla">QR
                        <input type="checkbox" />
                       </label>
                </span>
            </div>
            <div className="sarjat-kokonaisuus">
                <label>Sarjat</label>
                <span>
                    <label className="nimi-inputilla">3h
                        <input type="radio" name="sarjaradio" />
                    </label>
                    <label className="nimi-inputilla">1h
                        <input type="radio" name="sarjaradio" />
                    </label>
                </span>
            </div>
        </fieldset>
    )
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
    <App />,
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