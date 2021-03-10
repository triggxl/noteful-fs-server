const makeFoldersArray = () => {
  return [
    {
      "id": "b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1",
      "name": "Important"
    },
    {
      "id": "b07161a6-ffaf-11e8-8eb2-f2801f1b9fd1",
      "name": "Super"
    },
    {
      "id": "b07162f0-ffaf-11e8-8eb2-f2801f1b9fd1",
      "name": "Spangley"
    }
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedFolder = {
    ...maliciousFolder,
    id: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousFolder: maliciousFolder,
    expectedFolder: expectedFolder,
  }
}

module.exports = {
  makeFoldersArray: makeFoldersArray,
  makeMaliciousFolder: makeMaliciousFolder
}