import debounce from 'lodash/debounce';
import React from "react";
import { Col, Container, Form, FormControl, InputGroup, Row } from "react-bootstrap";
import { DateFilter } from "../DateFilter/DateFilter";

export class SearchFilter extends React.Component {
    state = {
        zoneInput: -1,
        keywordInput: null,
        exactDate: null,
        minDate: null,
        maxDate: null,
        nbResultsPerPage: 25,
        enableDateSearch: false
    }

    handleDateFilterChange = (event) => {
        this.setState({ exactDate: event.exactDate, minDate: event.minDate, maxDate: event.maxDate }, this._updateParent);
    }

    onChangeKeywordInput = debounce((event) => {
        this.handleKeywordFilterChange(event);
    }, 750)

    handleKeywordFilterChange = (event) => {
        this.setState({ keywordInput: event.target.value }, this._updateParent)
    }

    _updateParent = () => {
        this.props.onFilterChange({
            keywordInput: this.state.keywordInput,
            exactDate: this.state.exactDate,
            minDate: this.state.minDate,
            maxDate: this.state.maxDate,
            zone: this.state.zoneInput
        })
    }

    handleChangeResultsPerPage = (event) => {
        this.setState({ nbResultsPerPage: event.target.value }, () => {
            this.props.onChangeNbResultsPerPage(event.target.value);
        })
    }

    handleZoneChange = (event) => {
        this.setState({ zoneInput: event.target.value }, this._updateParent)
    }

    handleEnableDateSearch = (event) => {
        let isChecked = event.target.checked
        if (isChecked) {
            this.setState({ enableDateSearch: event.target.checked }, this._updateParent);
        } else {
            this.setState({
                enableDateSearch: event.target.checked,
                exactDate: null,
                minDate: null,
                maxDate: null,
            }, this._updateParent);
        }
    }

    render() {
        return (
            <Container className="border pt-2 pb-1 px-2" style={{ display: "block" }} >
                <Row>
                    <Col md={4} className="border-right">
                        <InputGroup>
                            <Row className="justify-content-md-center">
                                <Col md={12}>
                                    <p id="keyword-search-label">Recherche par mot-clé</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <FormControl size="sm"
                                        placeholder=""
                                        aria-label="Recherche par mot-clé"
                                        aria-describedby="keyword-search-label"
                                        onChange={this.onChangeKeywordInput}
                                    />
                                </Col>
                            </Row>
                        </InputGroup>
                    </Col>
                    <Col md={8}>
                        <InputGroup>
                            <Row className="justify-content-md-center">
                                <Col md={12}>
                                    <p id="date-search-label">
                                        <input
                                            name="enableDateSearch"
                                            type="checkbox"
                                            checked={this.state.enableDateSearch}
                                            onChange={this.handleEnableDateSearch}
                                            style={{ marginRight: "5px" }} />
                                        Recherche par date de création
                                        </p>
                                </Col>
                            </Row>
                            <Row>
                                <DateFilter onDateFiltersChange={this.handleDateFilterChange} enabled={this.state.enableDateSearch} />
                            </Row>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mt-3 pt-3 border-top" >
                    <Col md={8} className="align-self-center">
                        <FormControl as="select" size="xm" custom value={this.state.zoneInput} onChange={this.handleZoneChange}>
                            <option value={-1} key={-1}> &#x1F5FA;&#xFE0F; Toutes les zones</option>
                            <option value="inter">&#x1F30D; International</option>
                            <option value="fr">&#x1F950;  France</option>
                        </FormControl>
                    </Col>
                    <Col md={4} className="align-self-center">
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Form.Label className="text-muted" style={{ fontSize: "0.8rem", marginRight: "5px", display: "flex", alignItems: "center" }}>Nombre de résultats par page</Form.Label>
                            <FormControl as="select" size="xm" custom style={{ width: "65px", fontSize: "0.8rem" }} onChange={this.handleChangeResultsPerPage}>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </FormControl>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}