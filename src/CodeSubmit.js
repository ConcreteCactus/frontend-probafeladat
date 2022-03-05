import React from 'react';
import './App.css';
import  { monthNames
        , monthDayCount
        , isSameHour
        , isSameDay
        , parseMonthDay
        , stringifyMonthDay
        , stringifyDate
        , getResponseErrorMessages
        , isEmailValid
        , isCodeValid
        , isMonthDayValid
        , isHourValid
        , isMinuteValid
        , ErrorPrinter
        , ResponseDataPrinter
        , ResponseErrorPrinter
        } from './misc'

// This component is responsible for the form for uploading codes

class CodeSubmit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // Form input states \\
            email: '',
            code: '',
            minutes: -1,
            hours: -1,
            month: 2,
            day: 1,

            isShowingErrors: false, // Gets set to true on form submit
            responseError: undefined,
            responseData: undefined,
            isWaitingForResponse: false, // Controlls wether the submit button is disabled or not
        };

        // Callback functions from child components

        this.emailChange      = this.emailChange.bind(this);
        this.codeChange       = this.codeChange.bind(this);
        this.minuteChange     = this.minuteChange.bind(this);
        this.hourChange       = this.hourChange.bind(this);
        this.monthDayChange   = this.monthDayChange.bind(this);
        this.formSubmit       = this.formSubmit.bind(this);
        this.handleResponse   = this.handleResponse.bind(this);

        // Callback functions coming from parents

        this.goToRegisterPage = props.onRegisterNecessary;
        this.finishedSendingExternalPayload = props.onFinishedSendingExternalPayload;

        // Miscellanious functions that read component state

        this.constructDate = () => {
            const hours   = this.state.hours   >= 0 ? this.state.hours   : 0;
            const minutes = this.state.minutes >= 0 ? this.state.minutes : 0;
            return new Date(2022, this.state.month-1, this.state.day, hours, minutes, 0, 0);
        };

        this.emailErrorStatus = () => isEmailValid(this.state.email);
        this.codeErrorStatus  = () => isCodeValid(this.state.code);
        this.monthDayErrorStatus = () => isMonthDayValid(this.state.month, this.state.day);
        this.hourErrorStatus = () => isHourValid(this.state.hours);
        this.minuteErrorStatus = () => isMinuteValid(this.state.minutes);

        this.isEverythingValid = () => (
               this.emailErrorStatus() === 0
            && this.codeErrorStatus() === 0
            && this.monthDayErrorStatus() === 0
            && this.hourErrorStatus() === 0
            && this.minuteErrorStatus() === 0
        );

        this.constructHttpRequestPayload = () => (
            JSON.stringify({
                "email": this.state.email,
                "code": this.state.code,
                "purchase_time": stringifyDate(this.constructDate()),
            })
        );

        this.sendHttpRequest = (payload) => {
            let req = new XMLHttpRequest();
            req.addEventListener("load", () => this.handleResponse(req.responseText));
            req.open("POST", "https://ncp.staging.moonproject.io/api/harnasi-aron/code/upload");
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req.send(payload);
        }

        // Runs if the user is coming from the register page
        if(props.startWithPayload){
            console.log("Sending external payload");
            console.log(props.startWithPayload);
            this.sendHttpRequest(props.startWithPayload);
            this.finishedSendingExternalPayload();
        }

    }

    // Callback function definitions

    emailChange(event) {
        this.setState({
            email: event.target.value,
        });
        event.preventDefault();
    }

    codeChange(event) {
        this.setState({
            code: event.target.value,
        });
        event.preventDefault();
    }

    minuteChange(event) {
        let minutesParsed = parseInt(event.target.value);
        if(!isNaN(minutesParsed)) {
            this.setState({
                minutes: minutesParsed,
            });
        }
        event.preventDefault();
    }

    hourChange(event) {
        let hoursParsed = parseInt(event.target.value);
        if(!isNaN(hoursParsed)) {
            this.setState({
                hours: hoursParsed,
            });
        }
        event.preventDefault();
    }

    monthDayChange(event, action) {
        let md = parseMonthDay(event.target.value);
        if(md) {
            this.setState({
                month: md.month,
                day: md.day,
            });
        }
        event.preventDefault();
    }

    formSubmit(event) {
        event.preventDefault();
        this.setState({
            isShowingErrors: true,
            responseErrors: undefined,
            responseData: undefined,
        });

        if(this.isEverythingValid()){
            this.setState({
                isWaitingForResponse: true,
            });
            this.sendHttpRequest(this.constructHttpRequestPayload());
        }
    }

    handleResponse(response) {
        console.log(JSON.parse(response));
        
        const resp = JSON.parse(response);

        if( resp["errors"]
         && this.goToRegisterPage
         && resp["errors"].find(err => err["code"] === "email:not_found")
          ) {
            setTimeout(() => {
                let reqPayload = this.constructHttpRequestPayload();
                let reqEmail = this.state.email;
                this.goToRegisterPage(reqPayload, reqEmail);
            }, 3000);
        } else {
            this.setState({
                isWaitingForResponse: false,
            });
        }
        this.setState({
            responseErrors: resp["errors"],
            responseData: resp["data"],
        });
    }

    // ------- RENDER ------- \\

    render() {
        return (
            <form onSubmit={this.formSubmit}
                  noValidate
            >
                <label htmlFor="email">Email cím:</label>
                <input type="email" 
                       id="email"
                       name="email"
                       onChange={this.emailChange}
                       value={this.state.email}
                       required
                />
                <ErrorPrinter errorStatus={this.emailErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={["Ez nem egy valid email."]} />
                <label htmlFor="code">Kód:</label>
                <input type="text" 
                       id="code"
                       name="code"
                       onChange={this.codeChange}
                       value={this.state.code}
                       required
                />
                <ErrorPrinter errorStatus={this.codeErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                ["A kód az angol abc betűiből és számokból állhat, és mindig nyolcjegyű."]
                              }
                />
                <div className="horizontal">
                    <MonthDayOptions firstMonth={2}
                                     lastMonth={3}
                                     onChange={this.monthDayChange}
                                     value={stringifyMonthDay(this.state.month, this.state.day)}
                    />
                    <HourOptions forDate={this.constructDate()}
                                 onChange={this.hourChange}
                                 value={this.state.hours}
                    />
                    <MinuteOptions forDate={this.constructDate()}
                                   onChange={this.minuteChange}
                                   value={this.state.minutes}
                    />
                </div>
                <ErrorPrinter errorStatus={this.hourErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                ["Kérem, órának 0 és 23 közötti értéket adjon meg. A megadott időpont nem lehet az aktuális dátumnál későbbi."]
                              }
                />
                <ErrorPrinter errorStatus={this.monthDayErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                [ "Ezt a hónapot nem lehet választani. A megadott időpont nem lehet az aktuális dátumnál későbbi."
                                , "Ezt a napot nem lehet választani. A megadott időpont nem lehet az aktuális dátumnál későbbi."
                                ]
                              }
                />
                <ErrorPrinter errorStatus={this.minuteErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                ["Kérem, percnek 0 és 59 közötti értéket adjon meg. A megadott időpont nem lehet az aktuális dátumnál későbbi."]
                              } />
                <input type="submit"
                       name="submit"
                       id="submit"
                       value="Kódfeltöltés"
                       disabled={this.state.isWaitingForResponse}
                />
                <ResponseDataPrinter dataString={getResponseDataString(this.state.responseData)} />
                <ResponseErrorPrinter errorMessages={getResponseErrorMessages(this.state.responseErrors)} />
            </form>
        );
    }
}

// Renders the minute dropdown

function MinuteOptions(props) {

    let lastMinute = 59;
    if(props.forDate && isSameHour(props.forDate, new Date())){
        lastMinute = new Date().getMinutes();
    }

    const possibleMinutes = [(<option name="-1" key="-1"></option>)];
    for(let i = 0; i <= lastMinute; i++) {
        possibleMinutes.push(<option name={i} key={i}>{i}</option>);
    }

    return (
        <>
            <label htmlFor="minute">Perc:</label>
            <select id="minute"
                    name="minute"
                    value={props.value}
                    onChange={props.onChange}
                    required
            >
            {possibleMinutes}
            </select>
        </>
    );
}

// Renders the hour dropdown

function HourOptions(props) {

    let lastHour = 23;
    if(props.forDate && isSameDay(props.forDate, new Date())){
        lastHour = new Date().getHours();
    }

    const possibleHours = [(<option name="-1" key="-1"></option>)];
    for(let i = 0; i <= lastHour; i++) {
        possibleHours.push(<option name={i} key={i}>{i}</option>);
    }

    return (
        <>
            <label htmlFor="hour">Óra:</label>
            <select id="hour" name="hour" value={props.value} onChange={props.onChange}>
                {possibleHours}
            </select>
        </>
    );
}

// Renders the month-day dropdown

function MonthDayOptions(props) {

    const firstMonth = props.firstMonth || 1;
    const lastMonth = Math.min(props.lastMonth || 12, new Date().getMonth() + 1);
    const lastDay = new Date().getDate();

    const possibleDates = [];

    for(let i = firstMonth; i <= lastMonth; i++) {
        for(let j = 1; j <= (i < lastMonth ? monthDayCount[i-1] : lastDay); j++){
            const monthDayConcat = stringifyMonthDay(i, j);
            possibleDates.push(<option name={monthDayConcat} key={monthDayConcat}>{monthNames[i-1]} {j}.</option>);
        }
    }

    return (
        <>
            <label htmlFor="monthDay">Nap:</label>
            <select id="monthDay" name="monthDay" value={props.value} onChange={props.onChange}>
                {possibleDates}
            </select>
        </>
    );
}

// Miscellanius non-state dependant function (specific to the CodeSubmit component)

const getResponseDataString = (data) => {
    if(data){
        if(data["success"]) {
            if(data["won"]) {
                return "Sikeres feltöltés. Gratulálunk, nyertél!";
            } else {
                return "Sikeres feltöltés. Sajnos most nem nyertél!";
            }
        } else {
            return "Sikertelen feltöltés. Próbáld újra később.";
        }
    } else {
        return undefined;
    }
}

export default CodeSubmit;
