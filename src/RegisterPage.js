import React from 'react';
import './App.css';
import  { isEmailValid
        , isNameValid
        , isAgreeValid
        , getResponseErrorMessages
        , ErrorPrinter
        , ResponseDataPrinter
        , ResponseErrorPrinter
        } from './misc'

class RegisterPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            email: props.savedEmail || "",
            isEmailReadonly: !!props.savedEmail,
            name: "",
            agreeToRules: false,
            isShowingErrors: false,
            emailErrorStatus: props.savedEmail ? isEmailValid(props.savedEmail) : 1,
            nameErrorStatus: 1,
            agreeErrorStatus: 1,
            responseData: undefined,
            responseErrors: undefined,
        };


        this.emailChange    = this.emailChange.bind(this);
        this.nameChange     = this.nameChange.bind(this);
        this.agreeChange    = this.agreeChange.bind(this);
        this.formSubmit     = this.formSubmit.bind(this);
        this.handleResponse = this.handleResponse.bind(this);

        this.isEverythingValid = () => (
               this.state.emailErrorStatus === 0
            && this.state.nameErrorStatus === 0
            && this.state.agreeErrorStatus === 0
        );

        this.leaveRegisterPage = props.onLeaveRegisterPage;

        this.constructHttpRequestPayload = () => (
            JSON.stringify({
                "email": this.state.email,
                "name": this.state.name,
            })
        );

        this.sendHttpRequest = (payload) => {
            let req = new XMLHttpRequest();
            req.addEventListener("load", () => this.handleResponse(req.responseText));
            req.open("POST", "https://ncp.staging.moonproject.io/api/harnasi-aron/user/register");
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            console.log("Sending request");
            req.send(payload);
        }
    }

    emailChange(event) {
        this.setState({
            email: event.target.value,
            emailErrorStatus: isEmailValid(event.target.value),
        });
        event.preventDefault();
    }

    nameChange(event) {
        this.setState({
            name: event.target.value,
            nameErrorStatus: isNameValid(event.target.value),
        });
        event.preventDefault();
    }

    agreeChange(event) {
        this.setState({
            agreeToRules: event.target.checked,
            agreeErrorStatus: isAgreeValid(event.target.checked),
        });
    }

    formSubmit(event) {
        event.preventDefault();

        this.setState({
            isShowingErrors: true,
            responseData: undefined,
            responseErrors: undefined,
        });

        if(this.isEverythingValid()){
            this.sendHttpRequest(this.constructHttpRequestPayload());
        }
    }

    handleResponse(response) {
        console.log(JSON.parse(response));
        const resp = JSON.parse(response);
        this.setState({
            responseErrors: resp["errors"],
            responseData:   resp["data"],
        });

        if( resp["data"]
         && resp["data"].success
         && this.leaveRegisterPage
          ) {
            setTimeout(this.leaveRegisterPage, 1000);
        }
    }

    render() {

        console.log(this.state);
        return (
            <form onSubmit={this.formSubmit}
                  noValidate
            >
                <div>
                    <label htmlFor="email">E-Mail cím:</label>
                    <input type="email"
                           name="email"
                           id="email"
                           onChange={this.emailChange}
                           value={this.state.email}
                           readOnly={this.state.isEmailReadonly}
                    />
                </div>
                <ErrorPrinter errorStatus={this.state.emailErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={["Ez nem egy valid email."]}
                />
                <div>
                    <label htmlFor="name">Név:</label>
                    <input type="text"
                           name="name"
                           id="name"
                           onChange={this.nameChange}
                           value={this.state.name}
                    />
                </div>
                <ErrorPrinter errorStatus={this.state.nameErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                  ["A névnek betűkből és szóközökből kell állnia."]
                              }
                />
                <div>
                    <label htmlFor="name">Elfogadom a játékszabályokat.</label>
                    <input type="checkbox"
                           name="name"
                           id="name"
                           onChange={this.agreeChange}
                           checked={this.state.agreeToRules}
                    />
                </div>
                <ErrorPrinter errorStatus={this.state.agreeErrorStatus}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                  ["Ahhoz, hogy lehessen regisztrálni, el kell fogadni a játékszabályokat."]
                              }
                />
                <div>
                    <input type="submit"
                           id="submit"
                           name="submit"
                           value="Regisztrálok"
                    />
                </div>
                <ResponseDataPrinter dataString={getResponseDataString(this.state.responseData)} />
                <ResponseErrorPrinter errorMessages={getResponseErrorMessages(this.state.responseErrors)} />
            </form>
        );
    }
}

const getResponseDataString = (data) => {
    if(data){
        return data.success
        ? "Sikeres regisztráció."
        : "Sikertelen regisztráció.";
    } else {
        return undefined;
    }
}

export default RegisterPage;
