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

// This component is responsible for registering new email addresses

class RegisterPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // Form input states \\
            email: props.savedEmail || "",
            name: "",
            agreeToRules: false,

            isEmailReadonly: !!props.savedEmail,
            isShowingErrors: false,
            responseData: undefined,
            responseErrors: undefined,
            isWaitingForResponse: false,
        };

        // Callback functions for child components \\

        this.emailChange    = this.emailChange.bind(this);
        this.nameChange     = this.nameChange.bind(this);
        this.agreeChange    = this.agreeChange.bind(this);
        this.formSubmit     = this.formSubmit.bind(this);
        this.handleResponse = this.handleResponse.bind(this);

        // Callback function for parents \\

        this.leaveRegisterPage = props.onLeaveRegisterPage;

        // Miscellanious functions that read state \\

        this.emailErrorStatus  = () => isEmailValid(this.state.email);
        this.nameErrorStatus   = () => isNameValid(this.state.name);
        this.agreeErrorStatus  = () => isAgreeValid(this.state.agreeToRules);

        this.isEverythingValid = () => (
               this.emailErrorStatus() === 0
            && this.nameErrorStatus() === 0
            && this.agreeErrorStatus() === 0
        );

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

    // Callback function definitions \\

    emailChange(event) {
        this.setState({
            email: event.target.value,
        });
        event.preventDefault();
    }

    nameChange(event) {
        this.setState({
            name: event.target.value,
        });
        event.preventDefault();
    }

    agreeChange(event) {
        this.setState({
            agreeToRules: event.target.checked,
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
            this.setState({
                isWaitingForResponse: true,
            });
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
        } else {
            this.setState({
                isWaitingForResponse: false,
            });
        }
    }

    // ----- RENDER ----- \\

    render() {

        return (
            <form onSubmit={this.formSubmit}
                  noValidate
            >
                <label htmlFor="email">E-Mail cím:</label>
                <input type="email"
                       name="email"
                       id="email"
                       onChange={this.emailChange}
                       value={this.state.email}
                       readOnly={this.state.isEmailReadonly}
                />
                <ErrorPrinter errorStatus={this.emailErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={["Ez nem egy valid email."]}
                />
                <label htmlFor="name">Név:</label>
                <input type="text"
                       name="name"
                       id="name"
                       onChange={this.nameChange}
                       value={this.state.name}
                />
                <ErrorPrinter errorStatus={this.nameErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                  ["A névnek betűkből és szóközökből kell állnia."]
                              }
                />
                <div className="horizontal">
                <label htmlFor="name">Elfogadom a játékszabályokat.</label>
                <input type="checkbox"
                       name="name"
                       id="name"
                       onChange={this.agreeChange}
                       checked={this.state.agreeToRules}
                />
                </div>
                <ErrorPrinter errorStatus={this.agreeErrorStatus()}
                              doShowErrors={this.state.isShowingErrors}
                              errorMessages={
                                  ["Ahhoz, hogy lehessen regisztrálni, el kell fogadni a játékszabályokat."]
                              }
                />
                <input type="submit"
                       id="submit"
                       name="submit"
                       value="Regisztrálok"
                       disabled={this.state.isWaitingForResponse}
                />
                <ResponseDataPrinter dataString={getResponseDataString(this.state.responseData)} />
                <ResponseErrorPrinter errorMessages={getResponseErrorMessages(this.state.responseErrors)} />
            </form>
        );
    }
}

// RegisterPage specific miscellanious function that doesn't read state. \\

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
