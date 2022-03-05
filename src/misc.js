// Miscellanious function definitions (used by both CodeSubmit and RegisterPage)

const monthNames    = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
const monthDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const emailRegex    = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
const codeRegex     = /^[a-z0-9]{8}$/i
const nameRegex     = /^[\wáíűőüöúóé ]+$/i

const isSameHour = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth()    === date2.getMonth() &&
           date1.getDate()     === date2.getDate() &&
           date1.getHours()    === date2.getHours();
}

const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth()    === date2.getMonth() &&
           date1.getDate()     === date2.getDate();
}

const parseMonthDay = (md) => {

    const separated = md.split(" ");
    if(separated.length !== 2){ return undefined; }

    const monthInt = monthNames.findIndex(e => e === separated[0]) + 1;
    if(monthInt === -1){ return undefined; }

    const dayInt = parseInt(separated[1]);
    if(isNaN(dayInt)){ return undefined; }

    return {day: dayInt, month: monthInt};
}

const stringifyMonthDay = (month, day) => {
    return monthNames[month-1] + " " + day.toString() + ".";
}

// For the /code/upload request payload
const stringifyDate = (d) => (
      ""
    + d.getFullYear().toString().padStart(4, '0') + "-"
    + (d.getMonth()+1).toString().padStart(2, '0') + "-"
    + d.getDate().toString().padStart(2, '0') + " "
    + d.getHours().toString().padStart(2, '0') + ":"
    + d.getMinutes().toString().padStart(2, '0')
);

const getResponseErrorString = (errorCode) => {
    switch(errorCode) {
        case "email:invalid":
            return "Ez nem egy valid email.";
        case "email:required":
            return "Kérem, adja meg az email címét.";
        case "email:not_found":
            return "Ez az email cím még nincs regisztrálva a rendszerünkben. Pillanatokon belül átirányítjuk a regisztrációs oldalra.";
        case "code:invalid":
            return "Ez nem egy valid kód.";
        case "code:required":
            return "Kérem, adja meg a termékkódot.";
        case "purchase_time:invalid":
            return "A vásárlás időpontja nem megfelelő formátumban lett megadva.";
        case "purchase_time:required":
            return "Kérem adja meg a vásárlás időpontját.";
        case "purchase_time:too_early":
            return "A vásárlás időpontja túl korai.";
        case "purchase_time:too_late":
            return "A vásárlás időpontja túl késő.";
        case "name:invalid":
            return "A megadott név nem valid."
        case "name:required":
            return "A név nem lehet üres."
        default:
            return "A rendszer hibával tért vissza.";
    }
};

// Maps an array of errors to the human readable error texts
const getResponseErrorMessages = (responseErrors) => (
    responseErrors ? responseErrors.map(err => getResponseErrorString(err["code"])) : []
);

// Heaps of validation functions

const isEmailValid = (email) => emailRegex.test(email) ? 0 : 1;
const isCodeValid  = (code) => codeRegex.test(code) ? 0 : 1;
const isMonthDayValid = (month, day) => {
    if(month < 0 || month > new Date().getMonth() + 1) { return 1; }
    if( day < 0 
     || (  month < new Date().getMonth() + 1
        && day > monthDayCount[month]
        )
     || (  month === new Date().getMonth() + 1
        && day > new Date().getDate()
        )
    ) { return 2; }
    return 0;
}
const isHourValid   = (hour)   => 0 <= hour   && hour   <= 23 ? 0 : 1
const isMinuteValid = (minute) => 0 <= minute && minute <= 59 ? 0 : 1

const isNameValid = (name) => nameRegex.test(name) ? 0 : 1;
const isAgreeValid = (checked) => checked ? 0 : 1;

// Smaller components

function ErrorPrinter(props) {
    return props.doShowErrors && props.errorStatus > 0
    ? (<p>{props.errorMessages[props.errorStatus-1]}</p>)
    : (<></>);
}

function ResponseDataPrinter(props){
    if(props.dataString) { return (<div className="success"><p>{props.dataString}</p></div>); }
    else { return (<></>); }
}

function ResponseErrorPrinter(props) {
    let errorParagraphs = props.errorMessages.map((msg, i) => (<p key={i}>{msg}</p>))
    return (<div>{errorParagraphs}</div>);
}

export { monthNames
       , monthDayCount
       , emailRegex
       , codeRegex
       , isSameHour
       , isSameDay
       , parseMonthDay
       , stringifyMonthDay
       , stringifyDate
       , getResponseErrorString
       , getResponseErrorMessages
       , isEmailValid
       , isCodeValid
       , isMonthDayValid
       , isHourValid
       , isMinuteValid
       , isNameValid
       , isAgreeValid
       , ErrorPrinter
       , ResponseDataPrinter
       , ResponseErrorPrinter
       }
