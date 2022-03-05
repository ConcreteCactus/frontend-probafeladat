import React from 'react';
import './App.css';
import CodeSubmit from './CodeSubmit'
import RegisterPage from './RegisterPage'

// This is the main component of the App
// It either shows the CodeUpload or RegisterPage components

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isShowingRegisterPage: false,   // Controlls which component is shown
            savedRequest: undefined,        // The last request before showing the register page is saved here, so that we can resend it after registration is complete
            savedEmail: undefined,          // Same thing
        }

        // ----- Callback functions for components ----- \\

        this.handleGoToRegisterPage = this.handleGoToRegisterPage.bind(this);   // Called by CodeSubmit to change views
        this.handleLeaveRegisterPage = this.handleLeaveRegisterPage.bind(this); // Called by RegisterPage to change views
        this.handleFinishedSendingExternalPayload = this.handleFinishedSendingExternalPayload.bind(this); 
        // This is called by the CodeSubmit component, to indicate that savedRequest has been sent and can now be deleted
    }

    // ----- Definitions for callback functions ----- \\

    handleGoToRegisterPage(requestPayload, emailAddress) {
        this.setState({
            isShowingRegisterPage: true,
            savedRequest: requestPayload,
            savedEmail: emailAddress,
        });
    }

    handleLeaveRegisterPage() {
        this.setState({
            isShowingRegisterPage: false,
        });
    }

    handleFinishedSendingExternalPayload() {
        this.setState({
            savedRequest: undefined,
            savedEmail: undefined,
        });
    }

    // -------------- RENDER -------------- \\

    render() {
        if(!this.state.isShowingRegisterPage) {
            return (
                <CodeSubmit className="Form"
                            onRegisterNecessary={this.handleGoToRegisterPage}
                            startWithPayload={this.state.savedRequest}
                            onFinishedSendingExternalPayload={
                                this.handleFinishedSendingExternalPayload
                            }

                />
            );
        } else {
            return (
                <RegisterPage onLeaveRegisterPage={this.handleLeaveRegisterPage}
                              savedEmail={this.state.savedEmail}
                />
            );
        }
    }
}

export default App;
