module.exports = {
  checkIfContainKeysInArrayObjects: (array, keys) => {
    for (let i = 0; i < array.length; i++) {
      if (!Object.keys(array[i]).some((key) => keys.includes(key))) {
        return false;
      }
    }

    return true;
  },

  checkEveryKeyInArrayObjects: (array, keys) => {
    for (let a = 0; a < array.length; a++) {
      for (let i = 0; i < keys.length; i++) {
        if (!array[a][keys[i]]) {
          return false;
        }
      }
    }

    return true;
  },
  // check only the keys within keys
  // and returns the objects with those keys only.
  removeObjectDuplicatesFromArray: (array, keys) => {
    const newArray = array.filter(
      (el, index, self) =>
        index ===
        self.findIndex((e) => {
          let res = true;
          for (let i = 0; i < keys.length; i++) {
            if (e[keys[i]] !== el[keys[i]]) {
              res = false;
            }
          }

          return res;
        }),
    );

    return newArray;
  },

  cleanArrayObjects: (array, keys) => {
    const newArray = array.map((el) => {
      const newEl = {};

      for (let i = 0; i < keys.length; i++) {
        if (el[keys[i]]) {
          newEl[keys[i]] = el[keys[i]];
        }
      }

      return newEl;
    });

    return newArray;
  },
};
