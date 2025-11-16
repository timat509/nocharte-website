(function () {
  const COUNT = 67;
  window.PHOTOS = Array.from(
    { length: COUNT },
    (_, i) => `${i + 1}.png`
  );
})();
