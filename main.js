import { ApiPath, ParamName } from "./src/enum.js";
import {
   LIMIT_DEFAULT, 
  PARAM_AND_SEPARATOR, 
  PARAM_START_SYMBOL, 
  EXCEL_FILE_NAME_SEPARATOR, 
  EXCEL_FILE_EXTENSION,
  HISTORY_SEPARATOR
 } from "./src/constants.js";

const SERVER_BASE_URL = 'http://localhost:8080/search/car';

const searchHistoryList = document.getElementById('searchHistoryList');

searchHistoryList.addEventListener('click', (e) => {
  if (e.target.tagName != 'LI') {
    return;
  }

  const [brand, model, year, limit] = e.target.innerText.split(HISTORY_SEPARATOR);
  searchForm[ParamName.BRADN].value = brand;
  searchForm[ParamName.MODEL].value = model;
  searchForm[ParamName.YEAR].value = year;
  searchForm[ParamName.LIMIT].value = limit || LIMIT_DEFAULT;
});

await fetchSearchHistory();

const downloadExcelLink = document.getElementById('downloadExcel');
const contentHeader = document.getElementById('contentHeader');

const searchForm = document.getElementById('searchForm');
const resultsElement = document.getElementById('results');

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  contentHeader.innerText = 'Пошук...'
  downloadExcelLink.classList.remove('block');
  
  let query = '';

  const brand = searchForm[ParamName.BRADN].value.trim();
  const model = searchForm[ParamName.MODEL].value.trim();
  const year = searchForm[ParamName.YEAR].value.trim();
  const limit = searchForm[ParamName.LIMIT].value.trim() || LIMIT_DEFAULT;

  query += PARAM_START_SYMBOL + ParamName.BRADN + '=' + brand;
  query += model ? (PARAM_AND_SEPARATOR + ParamName.MODEL + '=' + model) : '';
  query += year ? (PARAM_AND_SEPARATOR + ParamName.YEAR + '=' + year) : '';
  query += PARAM_AND_SEPARATOR + ParamName.LIMIT + '=' + limit;

  try {
    let response = await fetch(SERVER_BASE_URL + query);

    if (!response.ok) {
      throw new Error("fetch error");
    } 

    await fetchSearchHistory();

    const cars = await response.json();
  
    const results = [];
  
    cars.forEach(({
      name, 
      price, 
      generation, 
      mileage, 
      engine, 
      currency, 
      akp, 
      vinCode, 
      checkedVinCode,
       afterAccident, 
       location, 
       link
      }) => {
        let li = document.createElement('li');
        li.innerHTML =  `
        <li class="item">
          <div class="columns">
              <ul class="column">
                  <li><span>Назва:</span> ${name}</li>
                  <li><span>Ціна:</span> $${price} ${currency}</li>
                  <li><span>Покоління:</span> ${generation}</li>
                  <li><span>Пробіг:</span> ${mileage} км</li>
                  <li><span>Двигун:</span> ${engine}</li>
              </ul>
              <ul class="column">
                  <li><span>Трансмісія:</span> ${akp}</li>
                  <li><span>VIN Code:</span> ${vinCode}</li>
                  <li><span>Провірений VIN Code:</span> ${checkedVinCode ? "Так" : "Ні"}</li>
                  <li><span>Після аварії:</span> ${afterAccident ? "Так" : "Ні"}</li>
                  <li><span>Місце знаходження:</span> ${location}</li>
                  <li><span>Посилання:</span> <a href="${link}">Більше інформації</a></li>
              </ul>
          </div>
        </li>
      `;
  
      results.push(li);
    });
    
    resultsElement.innerHTML = '';
    contentHeader.innerText = `Знайденo ${results.length} авто`;
    resultsElement.append(...results);

    if(results.length) {
      let fileName = brand + EXCEL_FILE_NAME_SEPARATOR;
      fileName += model ? model + EXCEL_FILE_NAME_SEPARATOR : "";
      fileName += year ? year + EXCEL_FILE_NAME_SEPARATOR : "";
      fileName += limit;
      
      downloadExcelLink.download = fileName + EXCEL_FILE_EXTENSION;
      downloadExcelLink.href = SERVER_BASE_URL + '/' + fileName + EXCEL_FILE_EXTENSION;
      downloadExcelLink.classList.add('block');
    } else {
      contentHeader.innerText = "Таких авто не знайдено :("
    }

  } catch (error) {
    console.log(error);
    contentHeader.innerText = "Щось пішло не так :("
  }
});

async function fetchSearchHistory() {
  try {
    const historyResponse = await fetch(`${SERVER_BASE_URL}/${ApiPath.HISTORY}`);

    if (!historyResponse.ok) {
      document.getElementById('searchHistory').innerText = 'Помилка при отриманні отаннього пошуку';

      throw new Error('Помилка при отриманні отаннього пошуку');
    }

    const history = await historyResponse.json();
    searchHistoryList.innerHTML = "";

    history.forEach(item => {
      let li = document.createElement('li');
      li.innerText = item.query;
      
      searchHistoryList.append(li);
    });
  } catch (error) {
    console.log(error);
  }
}

