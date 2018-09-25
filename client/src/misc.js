/**
 * Collection of miscellaneous utility functions
 */

const parseSemesterId = id => {
  const year = "20" + id.slice(0, 2);
  var sem = "";
  switch (id.slice(2)) {
    case "10":
      sem = "Fall";
      break;
    case "20":
      sem = "Winter";
      break;
    case "30":
      sem = "Spring";
      break;
    case "40":
      sem = "Summer";
      break;
    default:
      console.error("Something's wrong in semester id parsing.");
  }
  return year + " " + sem;
};

export { parseSemesterId };
