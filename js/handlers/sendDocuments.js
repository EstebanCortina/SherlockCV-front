export default (documents) => {
  if (!documents.length) {
    return false;
  }

  const formData = new FormData();
  for (doc of documents) {
    formData.append("file", doc);
  }

  fetch(`${process_env.api_url}`, {
    method: "POST",
    body: formData,
  })
    .then(response.json())
    .then((data) => {
      if (data.httpStatus !== 200) {
        throw data;
      }
      return true;
    });
};
