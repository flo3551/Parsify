import React from "react"
import API from "../../utils/API";
import { Button, FormGroup, FormControl, FormLabel, Image, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { CustomNavbar } from "../CustomNavbar/CustomNavbar";

export class Signup extends React.Component {
    state = {
        email: "",
        password: "",
        confirmPassword: ""
    };

    send = () => {
        const { email, password, confirmPassword } = this.state;
        if (!email || email.length === 0) {
            // TODO: handle form validation
            return;
        }
        if (!password || password.length === 0 || password !== confirmPassword) {
            // TODO: handle form validation
            return;
        }

        return API.signup(email, password)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                window.location = "/dashboard";
            })
            .catch(error => {
                console.error(error);
                // TODO: handle error
            })
    };

    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    render() {
        const { email, password, confirmPassword } = this.state;
        return (
            <>
                <CustomNavbar />
                <div className="Login">
                    <Image src="logo.png" style={{ width: "60%", marginBottom: "50px" }} />
                    <Form style={{ border: "1px ridge #ada9a8", padding: "20px", marginBottom: "20px", borderRadius: "15px" }}>
                        <FormGroup controlId="email" bssize="large">
                            <FormLabel>Email</FormLabel>
                            <FormControl autoFocus type="email" value={email} onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup controlId="password" bssize="large">
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl type="password" value={password} onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup controlId="confirmPassword" bssize="large">
                            <FormLabel>Confirmation du mot de passe</FormLabel>
                            <FormControl type="password" value={confirmPassword} onChange={this.handleChange} />
                        </FormGroup>
                        <Button onClick={this.send} block bssize="large">
                            Inscription
                        </Button>
                    </Form>
                    <Link to="/login" style={{ display: "block", marginTop: "10px" }}>J'ai déjà un compte</Link>
                </div>
            </>
        )
    }
}