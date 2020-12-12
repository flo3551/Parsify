import React from "react";
import { Card } from "react-bootstrap";
import Moment from 'react-moment';
import { DomainScreenshot } from '../DomainScreenshot/DomainScreenshot';

export class DomainDetails extends React.Component {

    render() {
        let domain = this.props.domain;
        if (!domain) {
            return (<h3>Sélectionnez un domaine pour voir les détails</h3>)
        }
        return (
            <Card style={{ position: "-webkit-sticky", position: "sticky", top: "20%"}} >
                <Card.Body>
                    <Card.Title>{domain?.domainName}</Card.Title>
                    <Card.Text>
                        Créé le <Moment date={domain?.dateRegistration} format="DD/MM/YYYY" />
                    </Card.Text>
                    <DomainScreenshot domainName={domain?.domainName} />
                </Card.Body>
            </Card>
        )
    }
}