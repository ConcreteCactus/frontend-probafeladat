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

class CodeSubmit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            code: '',
            minutes: -1,
            hours: -1,
            month: 2,
            day: 1,
            isShowingErrors: false,
            emailErrorStatus: 1,
            codeErrorStatus: 1,
            monthDayErrorStatus: 0,
            hourErrorStatus: 1,
            minuteErrorStatus: 1,
            responseError: undefined,
            responseDate: undefined,
        };

        this.emailChange      = this.emailChange.bind(this);
        this.codeChange       = this.codeChange.bind(this);
        this.minuteChange     = this.minuteChange.bind(this);
        this.hourChange       = this.hourChange.bind(this);
        this.monthDayChange   = this.monthDayChange.bind(this);
        this.formSubmit       = this.formSubmit.bind(this);
        this.handleResponse   = this.handleResponse.bind(this);

        this.goToRegisterPage = props.onRegisterNecessary;
        this.finishedSendingExternalPayload = props.onFinishedSendingExternalPayload;

        this.constructDate = () => {
            const hours   = this.state.hours   >= 0 ? this.state.hours   : 0;
            const minutes = this.state.minutes >= 0 ? this.state.minutes : 0;
            return new Date(2022, this.state.month-1, this.state.day, hours, minutes, 0, 0);
        };

        this.isEverythingValid = () => (
               this.state.emailErrorStatus === 0
            && this.state.codeErrorStatus === 0
            && this.state.monthDayErrorStatus === 0
            && this.state.hourErrorStatus === 0
            && this.state.minuteErrorStatus === 0
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

        if(props.startWithPayload){
            console.log("Sending external payload");
            console.log(props.startWithPayload);
            this.sendHttpRequest(props.startWithPayload);
            this.finishedSendingExternalPayload();
        }

    }

    emailChange(event) {
        this.setState({
            email: event.target.value,
            emailErrorStatus: isEmailValid(event.target.value),
        });
        event.preventDefault();
    }

    codeChange(event) {
        this.setState({
            code: event.target.value,
            codeErrorStatus: isCodeValid(event.target.value),
        });
        event.preventDefault();
    }

    minuteChange(event) {
        let minutesParsed = parseInt(event.target.value);
        if(!isNaN(minutesParsed)) {
            this.setState({
                minutes: minutesParsed,
                minuteErrorStatus: isMinuteValid(minutesParsed),
            });
        }
        event.preventDefault();
    }

    hourChange(event) {
        let hoursParsed = parseInt(event.target.value);
        if(!isNaN(hoursParsed)) {
            this.setState({
                hours: hoursParsed,
                hourErrorStatus: isHourValid(hoursParsed),
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
                monthDayErrorStatus: isMonthDayValid(md.month, md.day),
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
        }
        this.setState({
            responseErrors: resp["errors"],
            responseData: resp["data"],
        });
    }

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
                <ErrorPrinter errorStatus={this.state.emailErrorStatus}
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
                <ErrorPrinter errorStatus={this.state.codeErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                ["A kód az angol abc betűiből és számokból állhat, és mindig nyolcjegyű."]
                              }
                />
                <MonthDayOptions firstMonth={2}
                                 lastMonth={3}
                                 onChange={this.monthDayChange}
                                 value={stringifyMonthDay(this.state.month, this.state.day)}
                />
                <ErrorPrinter errorStatus={this.state.monthDayErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                [ "Ezt a hónapot nem lehet választani. A megadott időpont nem lehet az aktuális dátumnál későbbi."
                                , "Ezt a napot nem lehet választani. A megadott időpont nem lehet az aktuális dátumnál későbbi."
                                ]
                              }
                />
                <HourOptions forDate={this.constructDate()}
                             onChange={this.hourChange}
                             value={this.state.hours}
                />
                <ErrorPrinter errorStatus={this.state.hourErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                ["Kérem 0 és 23 közötti értéket adjon meg. A megadott időpont nem lehet az aktuális dátumnál későbbi."]
                              } />
                <MinuteOptions forDate={this.constructDate()}
                               onChange={this.minuteChange}
                               value={this.state.minutes}
                />
                <ErrorPrinter errorStatus={this.state.minuteErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                ["Kérem 0 és 59 közötti értéket adjon meg. A megadott időpont nem lehet az aktuális dátumnál későbbi."]
                              } />
                <ResponseDataPrinter dataString={getResponseDataString(this.state.responseData)} />
                <ResponseErrorPrinter errorMessages={getResponseErrorMessages(this.state.responseErrors)} />
                <input type="submit"
                       name="submit"
                       id="submit"
                       value="Kódfeltöltés"
                />
            </form>
        );
    }
}

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
            <label htmlFor="monthDay">Nap</label>
            <select id="monthDay" name="monthDay" value={props.value} onChange={props.onChange}>
                {possibleDates}
            </select>
        </>
    );
}

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
