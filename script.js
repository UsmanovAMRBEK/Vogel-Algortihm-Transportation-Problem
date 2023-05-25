// Global variables to store the matrix dimensions
let rows = 0;
let columns = 0;

// Function to create the grid dynamically
function createGrid() {
   // Get the dimensions of the matrix
   rows = parseInt(document.getElementById('rows').value);
   columns = parseInt(document.getElementById('columns').value);

   // Create the grid dynamically
   const gridContainer = document.getElementById('gridContainer');
   gridContainer.innerHTML = '';

   for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
         const gridItem = document.createElement('input');
         gridItem.type = 'number';
         gridItem.className = 'grid-item form-control';
         gridItem.placeholder = `Enter value for cell (${i + 1}, ${j + 1})`;
         gridContainer.appendChild(gridItem);
      }
   }

   // Create supply input fields
   const supplyValuesContainer = document.getElementById('supplyValues');
   supplyValuesContainer.innerHTML = '';

   for (let i = 0; i < rows; i++) {
      const supplyLabel = document.createElement('label');
      supplyLabel.textContent = `Supply ${i + 1}: `;
      const supplyInput = document.createElement('input');
      supplyInput.type = 'number';
      supplyInput.id = `supply_${i}`;
      supplyInput.className = 'form-control';
      supplyValuesContainer.appendChild(supplyLabel);
      supplyValuesContainer.appendChild(supplyInput);
   }

   // Create demand input fields
   const demandValuesContainer = document.getElementById('demandValues');
   demandValuesContainer.innerHTML = '';

   for (let j = 0; j < columns; j++) {
      const demandLabel = document.createElement('label');
      demandLabel.textContent = `Demand ${j + 1}: `;
      const demandInput = document.createElement('input');
      demandInput.type = 'number';
      demandInput.id = `demand_${j}`;
      demandInput.className = 'form-control';
      demandValuesContainer.appendChild(demandLabel);
      demandValuesContainer.appendChild(demandInput);
   }
}


// Function to calculate the VAM results
// Function to calculate the VAM results
function calculateVAM() {
   // Get the values from the grid
   const gridItems = document.getElementsByClassName('grid-item');
   const costMatrix = [];
   let currentRow = [];

   for (let i = 0; i < gridItems.length; i++) {
      const value = parseInt(gridItems[i].value);
      currentRow.push(value);

      if ((i + 1) % columns === 0) {
         costMatrix.push(currentRow);
         currentRow = [];
      }
   }

   // Validate the cost matrix dimensions
   if (costMatrix.length !== rows || costMatrix[0].length !== columns) {
      alert('Please fill in all the cells of the matrix.');
      return;
   }

   // Implement the VAM algorithm
   const supply = []; // Array to store supply values for each source
   const demand = []; // Array to store demand values for each destination

   // Get supply values from user input (assuming they are entered in a separate input field for each source)
   for (let i = 0; i < rows; i++) {
      const supplyInput = document.getElementById(`supply_${i}`);
      const supplyValue = parseInt(supplyInput.value);
      supply.push(supplyValue);
   }

   // Get demand values from user input (assuming they are entered in a separate input field for each destination)
   for (let j = 0; j < columns; j++) {
      const demandInput = document.getElementById(`demand_${j}`);
      const demandValue = parseInt(demandInput.value);
      demand.push(demandValue);
   }

   // Validate supply and demand values
   const totalSupply = supply.reduce((acc, val) => acc + val, 0);
   const totalDemand = demand.reduce((acc, val) => acc + val, 0);

   if (totalSupply !== totalDemand) {
      alert('Total supply must be equal to total demand.');
      return;
   }

   // Initialize allocation matrix and remaining supply and demand
   const allocation = [];
   let remainingSupply = [...supply];
   let remainingDemand = [...demand];

   for (let i = 0; i < rows; i++) {
      allocation[i] = [];

      for (let j = 0; j < columns; j++) {
         allocation[i][j] = 0;
      }
   }

   // Perform the VAM allocation
   while (remainingSupply.length > 0 && remainingDemand.length > 0) {
      // Calculate the costs for each empty cell
      const costs = [];

      for (let i = 0; i < rows; i++) {
         costs[i] = [];

         for (let j = 0; j < columns; j++) {
            if (allocation[i][j] === 0) {
               costs[i][j] = costMatrix[i][j];
            } else {
               costs[i][j] = Infinity; // Ignore allocated cells
            }
         }
      }

      // Find the cell with the minimum cost
      let minCost = Infinity;
      let minCostIndex = { row: -1, col: -1 };

      for (let i = 0; i < rows; i++) {
         for (let j = 0; j < columns; j++) {
            if (costs[i][j] < minCost) {
               minCost = costs[i][j];
               minCostIndex.row = i;
               minCostIndex.col = j;
            }
         }
      }

      // Perform allocation in the minimum cost cell
      const supplyIndex = minCostIndex.row;
      const demandIndex = minCostIndex.col;
      const quantity = Math.min(remainingSupply[supplyIndex], remainingDemand[demandIndex]);

      allocation[supplyIndex][demandIndex] = quantity;
      remainingSupply[supplyIndex] -= quantity;
      remainingDemand[demandIndex] -= quantity;

      // Remove fully allocated sources or destinations
      if (remainingSupply[supplyIndex] === 0) {
         remainingSupply.splice(supplyIndex, 1);
         allocation.splice(supplyIndex, 1);
      }

      if (remainingDemand[demandIndex] === 0) {
         remainingDemand.splice(demandIndex, 1);

         for (let i = 0; i < allocation.length; i++) {
            allocation[i].splice(demandIndex, 1);
         }
      }
   }

   // Display the results
   const resultContainer = document.getElementById('result');
   resultContainer.innerHTML = '<h2>Results:</h2>';
   resultContainer.innerHTML += '<h3>Allocation Matrix:</h3>';

   const allocationTable = document.createElement('table');
   allocationTable.className = 'allocation-table';

   for (let i = 0; i < allocation.length; i++) {
      const row = document.createElement('tr');

      for (let j = 0; j < allocation[i].length; j++) {
         const cell = document.createElement('td');
         cell.textContent = allocation[i][j];
         row.appendChild(cell);
      }

      allocationTable.appendChild(row);
   }

   resultContainer.appendChild(allocationTable);
}


// Add event listener to the Create Grid button
const createGridBtn = document.getElementById('createGridBtn');
createGridBtn.addEventListener('click', createGrid);

// Add event listener to the Calculate button
const calculateBtn = document.getElementById('calculateBtn');
calculateBtn.addEventListener('click', calculateVAM);
