const hideJar = function() {
  document.getElementById('jar').style.visibility = 'hidden';
  setTimeout(
    () => (document.getElementById('jar').style.visibility = 'visible'),
    1000
  );
};
