export function isEmpty(value: string) {
  return (value === null || value === '' || value === undefined || value === 'undefined');
}

export function isHttp(url: string) {
  return (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1);
}
