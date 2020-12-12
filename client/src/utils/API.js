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
    getDomainsForPageAndFilters: function (currentPage, nbResultsPerPage, keyword, zone, exactDate, minDate, maxDate, isFavoriteDomain, login) {
        return axios.get(`${burl}/getDomainsForPage`, { params: { page: currentPage.toString(), nbResultsPerPage: nbResultsPerPage.toString(), exactDate: exactDate, minDate: minDate, maxDate: maxDate, keyword: keyword, zone: zone, searchFavoritesDomains: isFavoriteDomain, userLogin: login }, headers: headers });
    },
    getCountDomains: function (keyword, zone, exactDate, minDate, maxDate, isFavoriteDomain, login) {
        return axios.get(`${burl}/getDomainsCount`, { params: { exactDate: exactDate, minDate: minDate, maxDate: maxDate, keyword: keyword, zone: zone, searchFavoritesDomains: isFavoriteDomain, userLogin: login } }, { headers: headers });
    },
    getDomainScreenshot: function (domainName) {
        return axios.get(`${burl}/getDomainsScreenshot`, { params: { domainName: domainName }, headers: headers });
    },
    addFavoriteDomain: function (userLogin, domainName) {
        return axios.post(`${burl}/addFavoriteDomain`, { userLogin, domainName }, { headers: headers });
    },
    deleteFavoriteDomain: function (userLogin, domainName) {
        return axios.post(`${burl}/deleteFavoriteDomain`, { userLogin, domainName }, { headers: headers });
    },
    isDomainFavorited: function (login, domainName) {
        return axios.get(`${burl}/isDomainFavorited`, { params: { userLogin: login, domainName: domainName }, headers: headers });
    },
};