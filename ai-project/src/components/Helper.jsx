export function checkHeading(str) {
  // Matches strings starting with "**" or "*"
  return /^(\*)(\*)(.*)\*$/.test(str);
}
export function replaceHeading(str){
    return str.replace(/^(\*)(\*)|(\*)$/g,'')
}