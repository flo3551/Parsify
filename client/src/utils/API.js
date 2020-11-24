import axios from "axios";
const headers = {
    "Content-Type": "application/json"
};
// const burl = "http://localhost:3001";
const burl = "http://51.77.149.226:3001";

export default {
    login: function (email, password) {
        return axios.post(
            `${burl}/login`,
            {
                email,
                password
            },
            {
                headers: headers
            }
        );
    },
    signup: function (email, password) {
        return axios.post(`${burl}/signup`, { email, password }, { headers: headers, });
    },

    isAuth: function () {
        return localStorage.getItem("token") !== null;
    },
    logout: function () {
        localStorage.clear();
    },
    getDomainsList: function () {
        return axios.get(`${burl}/getDomainsList`, { headers: headers });
    },
    getDomainsForPage: function (currentPage, nbResultsPerPage) {
        return axios.get(`${burl}/getDomainsForPage`, { params: { page: currentPage.toString(), nbResultsPerPage: nbResultsPerPage.toString() }, headers: headers });
    },
    getCountDomains: function () {
        return axios.get(`${burl}/getDomainsCount`, { headers: headers });
    },
    getDomainScreenshot: function (domainName) {
        return axios.get(`${burl}/getDomainsScreenshot`, { params: { domainName: domainName }, headers: headers });
    },
    getFilteredDomains: function (nbResultsPerPage, exactDate, minDate, maxDate, keyword) {
        return axios.get(`${burl}/getFilteredDomains`, { params: { nbResultsPerPage: nbResultsPerPage.toString(), exactDate: exactDate, minDate: minDate, maxDate: maxDate, keyword: keyword }, headers: headers });
    },
    getCountFilteredDomains: function (exactDate, minDate, maxDate, keyword) {
        return axios.get(`${burl}/getCountFilteredDomains`, { params: { exactDate: exactDate, minDate: minDate, maxDate: maxDate, keyword: keyword }, headers: headers });
    },
};