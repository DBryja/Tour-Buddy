export function getError(errors, prop) {
  try {
    return errors.mapped()[prop].msg;
  } catch (err) {
    return "";
  }
}

export function intoArray(item) {
  let arr = [];
  if (typeof item === "string") {
    arr.push(item);
  } else {
    arr = item;
  }
  return arr;
}
