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
    let uusiJoukkueID = etsiIsoinID(Array.from(state.kilpailu.joukkueet));
    
    // dynaamista jäsenkyselyä varten oletusluku: minkä verran tyhjiä kenttiä alussa
    let jasenluku = 2;

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
        // lisättyJoukkue lisätään uniikki id ja tyhjä rastileimaukset[]
        lisattyJoukkue.id = uusiJoukkueID;
        uusiJoukkueID += 1;
        lisattyJoukkue.rastileimaukset = [];

        // päivittää staten lisäämällä uuden joukkueen
        let uusistate = {...state};
        let uusidata = {...uusistate.kilpailu};
        let uusiJoukkueListaus = Array.from(uusidata.joukkueet);
        uusiJoukkueListaus.push(lisattyJoukkue);
        uusidata.joukkueet = uusiJoukkueListaus;
        uusistate.kilpailu = uusidata;
        setState(uusistate);

        console.log(uusistate);
        console.log("App sanoo: ", lisattyJoukkue, state.kilpailu);
    };

    /* jshint ignore:start */
    return (
        <div>
            <LisaaJoukkue
                lisaaJoukkue={lisaaJoukkue}
                kilpailu={state.kilpailu}
                jasenkyselyluku={jasenluku}/>
            <ListaaJoukkueet 
                joukkueet={state.kilpailu.joukkueet}
                leimaustavat={state.kilpailu.leimaustavat} />
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
const LisaaJoukkue = React.memo(function(props) {
    let leimaustavat = Array.from(props.kilpailu.leimaustavat);
    let joukkueenNimet = [];
    Array.from(props.kilpailu.joukkueet).map((item) => {
        joukkueenNimet.push(item.nimi);
    });
    let alkuJasenlista = [];
    for (let i = 0; i < props.jasenkyselyluku; i++) {
        alkuJasenlista.push("");
    }

    const [state, setState] = React.useState(
        {
            "nimi": "",
            "leimaustapa": [],
            "sarja": props.kilpailu.sarjat[0].id,
            "jasenet": alkuJasenlista
        }
    );

    /**
     * Jos joukkueen tiedoissa tai jäsenissä tulee muutosta
     * kutsutaan tätä (kertomalla mitä kohtaa muutetaan)
     * Nimi ja sarja muutetaan suoraan, koska niillä yksikäsitteinen arvo
     * Leimaustapalista muutetaan erillisellä listaan perehtyneellä changella
     * Jäsenet muutetaan toisella listaan perehtyneellä changella
     * @param {String} kohta "nimi", "sarja", "leimaustapa" tai "jasenet"
     * @param {Event.Target} eventTarget event.target
     */
    let valitseHandle = function(kohta, eventTarget) {
        if (kohta == "nimi"){
            handleChange(kohta, eventTarget.value);
        }
        else if (kohta == "sarja") {
            handleChange(kohta, eventTarget.id);
        } else if (kohta == "leimaustapa") {
            handleLeimaustavat(kohta, eventTarget);
        } else if (kohta == "jasenet") {
            handleJasenlista(kohta, eventTarget);
        }
    };

    /**
     * Tekee shallow kopion statesta ja
     * Vaihtaa annettuun kohtaan annetun sisällön
     * @param {String} kohta 
     * @param {Object} sisalto string tai array 
     */
    let handleChange = function(kohta, sisalto) {
        let uusistate = {...state};
        uusistate[kohta] = sisalto;
        setState(uusistate);
    };

    /**
     * Ylläpitää statessa tietoa checkatuista leimaustavoista
     * @param {String} kohta 
     * @param {Event.Target} eventTarget 
     */
    let handleLeimaustavat = function(kohta, eventTarget) {
        let objekti = eventTarget;
        let type = objekti.type;
        let newstate = {...state};

        // käytännössä väkisinkin checkbox, mutta mahdollista yhdistelyä ajatellen...
        if (type == "checkbox") {

            // luodaan uusi array nykyisistä checkatuista checkbokseista
            newstate[kohta] = Array.from(state[kohta]);

            // jos nyt klikattiin checkatuksi, lisätään listaan
            if (objekti.checked) {
                newstate[kohta].push(objekti.previousSibling.textContent);
            
            // muuten poistetaan listasta
            } else {
                newstate[kohta].splice(newstate[kohta].indexOf(objekti.previousSibling.textContent), 1);
            }
        }
        setState(newstate);
    };

    let handleJasenlista = function(kohta, eventTarget) {
        // otetaan käsitellyn jäsenen indeksi ylös
        let index = parseInt((eventTarget.id).replace(/[^0-9]/g, '')) - 1;
        let uudetJasenet = Array.from(state.jasenet);
        console.log(uudetJasenet);

        let nimi = eventTarget.value;
        // tarkistetaan onko jo sillä indeksillä sisältöä
        if (uudetJasenet[index] == "" || uudetJasenet[index]) {
            uudetJasenet[index] = nimi;
        } else {
            uudetJasenet.push(nimi);
        }

        if (nimi == "" && uudetJasenet.length > props.jasenkyselyluku) {
            uudetJasenet.splice(index, 1);
        }

        // tarkistaa onko alin jäsenkyselyn riveistä tyhjä ja lisää tyhjän
        let viimeinenOnTyhja = (uudetJasenet[uudetJasenet.length - 1] == "");

        if (!viimeinenOnTyhja) {
            uudetJasenet.push("");
        }

        handleChange(kohta, uudetJasenet);
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

        // tarkistaa että kaikissa kentissä on jotakin
        let kentat = ["nimi", "leimaustapa", "sarja", "jasenet"];
        let virheita = 0;
        for (let kentta of kentat) {
            if (state[kentta] == "" || state[kentta].length == 0) {
                virheita +=1;
                if (kentta == "sarja") {
                    // pitäisikö tehdä sarjoihin validitycheck..?
                    console.log("pitää olla valittuna vähintään yksi sarja");
                }
            }
        }

        // varmistaa että validityt eivät herjaa
        if (!event.target.form.checkValidity() || virheita > 0) {
            event.target.form.reportValidity();
            return;
        }

        // luo uuden joukkueen, johon lisätään tiedot oikeassa muodossa App:n tietoihin lisäämistä varten
        let uusiJoukkue = {...state};

        // lisätään sarja oikeassa muodossa
        uusiJoukkue.sarja = etsiSarjaIdnPerusteella(uusiJoukkue.sarja, props.kilpailu.sarjat);

        // lisätään leimauksien indeksit nimien sijaan
        let palautettavatLeimaukset = [];
        leimaustavat.map((item, index) => {
            if (uusiJoukkue.leimaustapa.includes(item)) {
                palautettavatLeimaukset.push(index);
            }
        });
        uusiJoukkue.leimaustapa = palautettavatLeimaukset;

        // luodaan jäsenistä sopivampi lista
        let palautettavatJasenet = [];
        let jasenisto = Array.from(state.jasenet);
        palautettavatJasenet = jasenisto.filter((item) => item != "");
        uusiJoukkue.jasenet = palautettavatJasenet;

        // luodaan tyhjä joukkue, jolla tyhjennetään formi
        let tyhjaJoukkue = {
            "nimi": "",
            "leimaustapa": [],
            "sarja": props.kilpailu.sarjat[0].id,
            "jasenet": alkuJasenlista
        };
        setState(tyhjaJoukkue);

        // lisätään joukkue App:n lisaaJoukkue-funktiolla
        props.lisaaJoukkue(uusiJoukkue);
    };

    /* jshint ignore:start */
    return (
        <form>
            <JoukkueenTiedot
                change={valitseHandle}
                nimi={state.nimi}
                nimet={joukkueenNimet}
                sarjat={props.kilpailu.sarjat}
                selectedSarja={state.sarja}
                leimaustavat={leimaustavat}
                checkedCheckboxes={state.leimaustapa}/>
            <DynaamisetJasenet
                jasenet={state.jasenet}
                change={valitseHandle}
                jasenkyselyluku={props.jasenkyselyluku}/>
            <button onClick={handleLisaa}>Tallenna</button>
        </form>);
});


/**
 * JoukkueenTiedot pitää omaa statea, jossa on:
 * - inputtien tiedot (nimi, mitkä leimaustavat, sarjat)
 * Propseissa:
 * .change (funktio, joka muokkaa LisaaJoukkueen statea)
 * .nimi (LisaaJoukkue bindattu nimi inputtiin)
 * .sarjat (lista sarjoista)
 * .selectedSarja (LisaaJoukkue bindattu sarja input-joukkoon)
 * .leimaustavat (lista leimaustavoista)
 * .checkedCheckboxes (bindattu lista tsekatuista leimaustavoista)
 */
const JoukkueenTiedot = React.memo(function JoukkueenTiedot(props) {

    let sarjat = Array.from(props.sarjat);
    sarjat.sort(aakkosjarjestysNimenMukaan);

    let nimet = Array.from(props.nimet).map((item) => item.trim().toLowerCase());

    let leimaustavat = Array.from(props.leimaustavat).sort();

    let muutaNimea = function(event) {
        let validity = event.target.validity;
        if (validity.badInput || validity.patternMismatch || validity.rangeOverflow || validity.rangeUnderflow || validity.tooLong || validity.tooShort || validity.typeMismatch || validity.valueMissing || !event.target.value.trim()) {
            event.target.setCustomValidity("Vähintään yksi merkki (ei välilyönti)");
        } else if (nimet.includes(event.target.value.trim().toLowerCase())) {
            event.target.setCustomValidity("Samanniminen joukkue on jo olemassa");
        } else {
            event.target.setCustomValidity("");
        }
        props.change("nimi", event.target);
    };


    let muutaInputinSisaltoa = function(kohta, event) {
        props.change(kohta, event);
    };

    /* jshint ignore:start */
    return (
        <fieldset>
            <legend>Joukkueen tiedot</legend>
            <label>Nimi
                <input type="text" value={props.nimi} required="required" onChange={muutaNimea} />
            </label>
            <div className="leimaustavat-kokonaisuus">
                <label>Leimaustavat</label>
                <CheckboxLista name="leimaustapa" change={muutaInputinSisaltoa} items={leimaustavat} type="checkbox" checked={props.checkedCheckboxes}/>
            </div>
            <div className="sarjat-kokonaisuus">
                <label>Sarjat</label>
                <SarjaLista name="sarja" change={muutaInputinSisaltoa} type="radio" items={sarjat} selected={props.selectedSarja} />
            </div>

        </fieldset>
    )
    /* jshint ignore:end */
});

const SarjaLista = React.memo(function SarjaLista(props) {

    let muutaSisaltoa = function (event) {
        props.change(props.name, event.target);
    };

    /* jshint ignore:start */
    let listaus = [];
    let i = 0;
    for (let item of props.items) {
        let rivi = (
            <label className="nimi-inputilla" key={item.id}>
                {item.nimi}
                <input
                    type={props.type}
                    name={props.name}
                    onChange={muutaSisaltoa}
                    checked={item.id == props.selected}
                    id={item.id}
                />
            </label>
        );
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
 const CheckboxLista = React.memo(function CheckboxLista(props) {

    let muutaSisaltoa = function (event) {
        props.change(props.name, event.target);
    };

    /* jshint ignore:start */
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

/**
 * JoukkueenTiedot pitää omaa statea, jossa on:
 * - jaseninputtien tiedot
 * Propseissa tuo:
 * .jasenet (lista jäsenistä)
 * .change (funktio, joka muokkaa LisaaJoukkueen statea)
 * .jasenkyselyluku (määrä, montako jäsenkyselyriviä alussa/vähintään on)
 */
const DynaamisetJasenet = React.memo(function DynaamisetJasenet(props) {

    // tarkistuksia varten jäsenet pienellä lista
    let jasenetPienella = Array.from(props.jasenet).map((item) => item.trim().toLowerCase());

    // funktio jäsenen muuttamista varten
    let muutaJasenta = function(event) {
        if (event.target.value != "" && jasenetPienella.includes(event.target.value.trim().toLowerCase())) {
            event.target.setCustomValidity("Jokaisen jäsenen nimen tulee olla uniikki");
        } else {
            event.target.setCustomValidity("");
        }
        props.change("jasenet", event.target);
    };


    /* jshint ignore:start */
    // luo dynaamisesti oikean määrän jäsenkyselyrivejä
    let jasenKyselyt = [];
    for (let i = 1; i <= jasenetPienella.length; i++) {
        let req = "";
        if (i <=2) {
            req = "required";
        }
        let id = "jasen" + i;
        let rivi = (
            <label key={i}>Jäsen {i}
                <input type="text" id={id} value={props.jasenet[i-1]} required={req} onChange={muutaJasenta}/>
            </label>
        )
        jasenKyselyt.push(rivi);
    }


    return (
    <fieldset>
        <legend>Jäsenet</legend>
        {jasenKyselyt}
    </fieldset>
        
    );
    /* jshint ignore:end */
});

/**
 * Listaa joukkueet aakkosjärjestykseen ensisijaisesti sarjan mukaan,
 * sitten joukkueen nimen mukaan
 * Joukkueen yhteydessä listataan myös joukkueen käyttämät leimaustavat aakkosjärjestyksessä
 * Propseissa tulee tiedot:
 * .joukkueet (lista joukkue-objekteista, joista haetaan tiedot)
 * .leimaustavat (lista leimaustavoista, joiden indeksit löytyvät joukkueista)
 */
const ListaaJoukkueet = React.memo(function(props) {
    let joukkueetJarjestyksessa = Array.from(props.joukkueet).sort(aakkostaSarjanJaNimenMukaan);
    /* jshint ignore:start */

    let rivit = [];
    for (let joukkue of joukkueetJarjestyksessa) {
        let leimaustapalista = [];
        for (let lt of joukkue.leimaustapa) {
            leimaustapalista.push(
                <li key={lt}>{props.leimaustavat[lt]}</li>);
        }
        leimaustapalista.sort();

        let rivi = (
            <tr key={joukkue.id}>
                <th>{joukkue.sarja.nimi}</th>
                <th>
                    <div>
                        {joukkue.nimi}
                    </div>
                    <div>
                        <ul>
                            {leimaustapalista}
                        </ul>
                    </div>
                </th>
            </tr>
        )
        rivit.push(rivi);
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Sarja</th>
                    <th>Joukkue</th>
                </tr>
            </thead>
            <tbody>
                {rivit}
            </tbody>
        </table>);
    /* jshint ignore:end */
});


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
 * Aakkostaa joukkueet ensisijaisesti sarjan nimen mukaan
 * toissijaisesti joukkueen nimen mukaan
 * Ei huomioi alun tai lopun whitespacea
 * Vertailee kaikki lowercasena
 * @param {Object} a ensimmäinen vertailtava joukkue 
 * @param {Object} b toinen vertailtava joukkue
 * @returns 
 */
function aakkostaSarjanJaNimenMukaan(a,b) {
    let asarja = a.sarja.nimi.trim().toLowerCase();
    let bsarja = b.sarja.nimi.trim().toLowerCase();
    let animi = a.nimi.trim().toLowerCase();
    let bnimi = b.nimi.trim().toLowerCase();

    if (asarja < bsarja) {
        return -1;
    }
    if (bsarja < asarja) {
        return 1;
    }
    if (animi < bnimi) {
        return -1;
    }
    if (bnimi < animi) {
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


/**
 * Etsii listan alkio.id seasta suurimman luvun ja lisää siihen yhden
 * Palauttaa etsityn luvun
 * @param {Array} lista 
 * @returns {Number} kokonaisluku, joka on isompi kuin listan yksikään id
 */
function etsiIsoinID(lista) {
    let uusiID = lista[0].id;
    for (let joukkue of lista) {
        if (joukkue.id > uusiID) {
            uusiID = joukkue.id;
        }
    }
    uusiID += 1;
    return uusiID;
}