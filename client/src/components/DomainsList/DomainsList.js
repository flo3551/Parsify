import React from "react";
import { Table, Row } from "react-bootstrap";
import API from "../../utils/API";
import { FiArrowRightCircle } from "react-icons/fi";
import { CustomPagination } from "../CustomPagination/CustomPagination";

export class DomainsList extends React.Component {
    state = {
        domains: [],
        domainsCount: 0,
        selectedDomain: null,
        currentPage: 1,
        resultsDisplayPerPage: 20
    }

    componentDidMount() {
        this._updateDomains();
    }

    onClickDomainRow = (domain) => {
        this.setState({ selectedDomain: domain });
        this.props.onSelectedDomainChange(domain);
    }

    onChangePage = (newPage) => {
        this.setState({currentPage: newPage}, this._updateDomains);
    }

    _updateDomains = () => {
        API.getDomainsForPage(this.state.currentPage, this.state.resultsDisplayPerPage)
            .then(response => {
                this.setState({ domains: response.data.domainsList });
                return API.getCountDomains()
            })
            .then(response => {
                this.setState({ domainsCount: response.data.domainsCount });
            })
    }

    isSelectedDomain = (domain) => {
        return this.state.selectedDomain === domain;
    }

    render() {
        return (
            <div>
                <Row className="justify-content-center">
                    <Table striped bordered hover>
                        <thead>
                            {/* FILTERS COMES HERE */}
                        </thead>
                        <tbody>
                            {this.state.domains.map((domain, index) => (
                                <tr className={this.isSelectedDomain(domain) ? "bg-secondary text-light" : ""}>
                                    <td onClick={() => { this.onClickDomainRow(domain) }}>
                                        {domain.domainName}

                                        {this.isSelectedDomain(domain) && <FiArrowRightCircle className="float-right" style={{ fontSize: "30px" }} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <CustomPagination currentPage={this.state.currentPage} totalResults={this.state.domainsCount} pageChangeHandler={this.onChangePage}/>
                </Row>
            </div>
        )
    }
}