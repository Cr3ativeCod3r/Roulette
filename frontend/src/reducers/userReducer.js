
export function userReducer(
  state = localStorage.getItem("jwtToken") ? localStorage.getItem("jwtToken") : null,
  action
) {
  switch (action.type) {
    case "LOGIN":
      return action.payload;
    case "LOGOUT":
        return null;

    default:
      return state;
  }
}

