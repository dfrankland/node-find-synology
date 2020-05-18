import fetch from 'node-fetch';
import vm from 'vm';

export const URL_GLOBAL_QUICKCONNECT_TO = 'global.quickconnect.to';

// This URL is also referenced, but doesn't seem used.
// const URL_GLOBAL_QUICKCONNECT_CN = 'global.quickconnect.cn';

// Seems like some arbitrary limit on the UI.
export const MAX_URLS = 30;

export const JSONP_CALLBACK = 'poll_callback';
export const JSONP_CALLBACK_INDEX = 0;

export const SEARCH_RESULT_DELAY = 1000;

export const getUnixTimeStampMs = () => Date.now();

export const getFinderSite = async () => {
  const response = await fetch(
    `https://${URL_GLOBAL_QUICKCONNECT_TO}/finder/server?_dc=${getUnixTimeStampMs()}`,
  );
  const text = await response.text();

  const matches = text.match(/syno_finder_site=(.*)/);

  if (Array.isArray(matches) && typeof matches === 'string') {
    return matches[1];
  }

  return URL_GLOBAL_QUICKCONNECT_TO;
};

export const getQuickConnectUrls = async (finderSite) => {
  if (typeof finderSite !== 'string') {
    return;
  }

  const response = await fetch(
    `https://${finderSite}/finder/get.php?_dc=${getUnixTimeStampMs()}`,
  );
  const json = await response.json();

  return json;
};

export const stringifyQuickConnectUrls = ({ hosts, httpPort, httpsPort }) => {
  const urls = [];

  if (httpPort) {
    urls.push(...hosts.map((host) => `http://${host}:${httpPort}`));
  }

  if (httpsPort) {
    urls.push(...hosts.map((host) => `https://${host}:${httpsPort}`));
  }

  return urls;
};

export const parseUrls = (quickConnectUrls) => {
  if (!Array.isArray(quickConnectUrls)) {
    return [];
  }

  const maxUrls = quickConnectUrls.slice(0, MAX_URLS);

  return maxUrls.reduce(
    (
      acc,
      {
        ipv4_interface: ipv4Hosts,
        ipv6_interface: ipv6Hosts,
        port: httpPort,
        https_port: httpsPort,
      },
    ) => {
      if (Array.isArray(ipv4Hosts)) {
        acc.push(
          ...stringifyQuickConnectUrls({
            hosts: ipv4Hosts,
            httpPort,
            httpsPort,
          }),
        );
      }
      if (Array.isArray(ipv6Hosts)) {
        acc.push(
          ...stringifyQuickConnectUrls({
            hosts: ipv6Hosts,
            httpPort,
            httpsPort,
          }),
        );
      }
      return acc;
    },
    [],
  );
};

export const search = async (agentUrl) => {
  const response = await fetch(
    `${agentUrl}/webman/search.cgi?_dc=${getUnixTimeStampMs()}`,
  );
  const json = await response.json();
  if (!json.success) {
    throw Error('Search was unsuccessful');
  }
  return json;
};

export const searchResult = async (agentUrl) => {
  const response = await fetch(
    `${agentUrl}/webman/search_result.cgi?_dc=${getUnixTimeStampMs()}&callback=${JSONP_CALLBACK}&idx=${JSONP_CALLBACK_INDEX}`,
  );
  const text = await response.text();
  if (!text.trim()) {
    throw new Error('Empty search result');
  }
  return text;
};

export const doSearch = async (agentUrls) => {
  for (const agentUrl of agentUrls) {
    try {
      const searchPromise = search(agentUrl);

      const searchResultPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve(searchResult(agentUrl));
        }, SEARCH_RESULT_DELAY);
      });

      // Search results can only be made while a search is in progress.
      // Search should always take ~5 seconds to complete which is more than
      // enough time for a search result to be returned.
      const searchResultScript = await Promise.race([
        searchPromise,
        searchResultPromise,
      ]);

      let resultResolve;
      const result = new Promise((resolve) => {
        resultResolve = resolve;
      });

      const script = new vm.Script(searchResultScript);

      const context = {};
      context[JSONP_CALLBACK] = [];
      const fn = (devices) => {
        resultResolve(devices);
      };
      context[JSONP_CALLBACK][JSONP_CALLBACK_INDEX] = {
        fn,
        scope: fn,
      };

      setTimeout(() => {
        script.runInNewContext(context);
      }, 0);

      return await result;
    } catch (err) {
      // do nothing
    }
  }

  throw new Error('Search failed');
};

export default async () => {
  const finderSite = await getFinderSite();
  const quickConnectUrls = await getQuickConnectUrls(finderSite);
  const agentUrls = parseUrls(quickConnectUrls);
  return await doSearch(agentUrls);
};
