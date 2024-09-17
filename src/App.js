
import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [urls, setUrls] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);


  const getData = async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok)
        return null;

      const data = await response.json();
      return data;


    } catch (error) {
      console.error('ERROR FETCHING DATA:', error);
      return null;
    }
  };



  const fetchFirstData = async () => {
    setLoading(true);
    let tmp = [];
    const url = "https://cdn.taboola.com/mobile-config/home-assignment/messages.json";

    const data = await getData(url);

    if (!data) {
      setLoading(false);
      return;
    }

    data.map((item) => {
      if (item && item._source && item._source.message)
        item._source.message.map((message) => {
          if (message && message.link && message.link.url) {
            const url = new URL(message.link.url);
            const params = new URLSearchParams(url.search);
            const redirectUrl = params.get('redirect');
            if (redirectUrl) {
              tmp.push(redirectUrl);
            }
          }

        })
    });
    setUrls(tmp);

    setLoading(false);

  };

  const fetchSecondData = async () => {
    setLoading(true);
    const url = "https://cdn.taboola.com/mobile-config/home-assignment/data.json";
    const data = await getData(url);
    if (!data) {
      setLoading(false);
      return;
    }

    setLoading(false);
    return data;
  }

  const filterCompanies = (companies) => {

    const filteredCompanies = companies.filter((item) => {
      return urls.includes(item.url);
    });

    return filteredCompanies;
  };

  const sortCompanies = (companies) => {

    const sortedCompanies = companies.sort((a, b) => {
      return a.country.localeCompare(b.country) || b.est_emp - a.est_emp;
    });

    return sortedCompanies;
  };




  const getCompanies = async () => {

    const data = await fetchSecondData();
    if (!data) {
      setLoading(false);
      return;
    }

    const filteredCompanies = filterCompanies(data);
    const sortedCompanies = sortCompanies(filteredCompanies);
    setCompanies(sortedCompanies);
    setLoading(false);
  };

  useEffect(() => {
    fetchFirstData();
  }, []);

  useEffect(() => {
    if (urls.length > 0) {
      getCompanies();
    }
  }, [urls]);


  return (
    <div >
      <div style={{ margin: "50px" }}>
        <h1>Companies</h1>
        {loading ? <p>Loading...</p> : companies.length === 0 ? (<p>No companies available.</p>) :
          (companies.map((company, i) => {
            return <div key={i}>
              <h2>{i + 1}. {company.name}</h2>
              <div style={{ marginLeft: "3rem" }}>
                <h3>{company.country}</h3>
                <h4>estimated number of workers: {company.est_emp}</h4>
                <a href={`${company.url}`} target='_blank'>{company.url} </a>
                <p>{JSON.stringify(company)}</p>
              </div>
            </div>

          }
          ))}
      </div>
    </div>
  );
}

export default App;
