const dns = require("dns").promises;
const config = require("./configs");
let data = require("./data.json");

const ipRegex = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)(?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/;

const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

const isDomainOrIp = (data) => {
  const domain = data?.match(domainRegex);
  const ip = data?.match(ipRegex);
  if (ip) return ip[0];
  else if (domain) return domain[0];
  throw new Error("Invalid Input");
};

const isSubDomain = (domain) => {
  const splittedDomain = domain?.split(".");
  if (splittedDomain?.length > 2 && splittedDomain[0] !== "www")
    return splittedDomain[1] + "." + splittedDomain[2];
  return domain;
};

const getPriority = (value) => {
  value = isSubDomain(value);
  return value in config ? config[value].priority : -1;
};

const sortByPriority = () => {
  try {
    data.sort((curr, next) => {
      curr = isDomainOrIp(curr);
      next = isDomainOrIp(next);
      return getPriority(next) - getPriority(curr);
    });
    return data.map(async (value) => await dns.lookup(value, 4));
  } catch (error) {
    console.error(error?.message);
  }
};

console.log(data);

const result = Promise.allSettled(sortByPriority()).then((value) =>
  value.forEach((ip) => console.log(ip.value.address))
);
