const axios = require("axios");
const dns2 = require("dns2");
const fs = require("node:fs");

//Need to get new api keys when running the script
const HOST10_API_KEY = "";
const HOST_API_KEY = "";

//Change the constant to the key to the server you are targeting
const auth_header = `whm root:${HOST_API_KEY}`;

//add your domain to the front of /json-api
const HOST10_BASE_URL = "/json-api";

const HOST_BASE_URL = "/json-api";

const options = {
  headers: {
    Authorization: auth_header,
  },
};

async function getDomains() {
  var host_domains = [];

  const response = await axios.get(
    //Change the base url to the server you are targeting
    `${HOST_BASE_URL}/get_domain_info?api.version=1`,
    options
  );
  //console.log(response.data);
  response.data.data.domains.map((domain) => {
    //console.log(domain.domain);
    //push to the array that will be written to a csv
    host_domains.push(domain.domain);
  });

  return host_domains;
}

async function getDNSZone(domain) {
  const response = await axios.get(
    `${HOST_BASE_URL}/parse_dns_zone?api.version=1&zone=${domain}`,
    options
  );
  //console.log(response.data);
}

async function main() {
  const domains = await getDomains();
  const dns = new dns2({ dns: ["8.8.8.8"] });

  (async () => {
    const result = await dns.resolve(domains[0], "NS");
    domains.map((domain) => {
      const result = dns.resolve(domain, "NS").then((data) => {
        //console.log(data.answers);
        data.answers.map((a) => {
          const name = a.name;
          const ns = a.ns;
          //console.log(name, ns);
          fs.appendFile("dns_host.csv", `${name},${ns}\n`, (err) => {
            if (err) throw err;
          });
        });
      });
    });
  })();
}

main();
