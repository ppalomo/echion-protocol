export function truncateMiddle (fullStr, strLen, separator) {
    if (fullStr === null) return null;
    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
};

export function truncateRight (fullStr, strLen, separator) {
    if (fullStr === null) return null;
    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    return fullStr.substr(0, strLen) + separator ;
};

export const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str)
    .replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;