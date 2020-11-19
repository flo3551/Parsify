import React from "react";
import { CustomNavbar } from "../CustomNavbar/CustomNavbar";
import { DomainsList } from "../DomainsList/DomainsList";
import { Row, Col } from "react-bootstrap";
import { DomainDetails } from "../DomainDetails/DomainDetails";

export class Dashboard extends React.Component {
    state = {
        selectedDomain: null
    }

    onChangeSelectedDomain = (domain) => {
        this.setState({selectedDomain: domain});
    }

    render() {
        return (
            <>
                <CustomNavbar />
                <div className="Dashboard">
                    <h1 style={{marginTop: "25px", marginBottom: "50px"}}>Dashboard</h1>
                    <Row className="justify-content-md-center" >
                        <Col md={5}>
                            <DomainsList onSelectedDomainChange={this.onChangeSelectedDomain}/>
                        </Col>
                        <Col md={6}>
                            <DomainDetails domain={this.state.selectedDomain}/>
                        </Col>
                    </Row>
                </div>
            </>
        )
    }
}