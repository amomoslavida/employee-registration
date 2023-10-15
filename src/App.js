import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { PrimeReactProvider } from 'primereact/api';
import { Tree } from 'primereact/tree';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  
import UpdateEmployee from './UpdateEmployee';
function App() {
    const [name, setName] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [selectedKey, setSelectedKey] = useState(null);
    const [expandedKeys, setExpandedKeys] = useState({});
    const [isUpdate, setIsUpdate] = useState(false);
    const [employeeIDToUpdate, setemployeeIDToUpdate]  = useState({});
    const [employees, setEmployees] = useState({});

    const buildNodes = (sectors) => {
        let rootNode = {
            id: 'root',
            label: 'Root',
            children: []
        };

        let byId = {};

        JSON.parse(sectors).forEach(function(sector) {
            let node = {
                id: String(sector.SectorID),
                key: sector.SectorID,
                label: sector.SectorName,
                children: []
            };

            byId[sector.SectorID] = node;

            if (sector.ParentSectorID) {
                if (!byId[sector.ParentSectorID]) {
                    byId[sector.ParentSectorID] = {
                        id: String(sector.ParentSectorID),
                        key: sector.ParentSectorID,
                        children: []
                    };
                }
                byId[sector.ParentSectorID].children.push(node);
            } else {
                rootNode.children.push(node);
            }
        });

        setNodes(rootNode.children);

        let _expandedKeys = {};
        for (let node of nodes) {
            expandNode(node, _expandedKeys);
        }

        setExpandedKeys(_expandedKeys);
    }

    const expandNode = (node, _expandedKeys) => {
        if (node.children && node.children.length) {
            _expandedKeys[node.key] = true;

            for (let child of node.children) {
                expandNode(child, _expandedKeys);
            }
        }
    };

    useEffect(() => {
        const FetchSectors = async () => {
            try {
                const response = await axios.get('https://localhost:7194/FetchAllSectorsAsJson');
                buildNodes(response.data);
            } catch (error) {
                console.error('Error fetching todos:', error);
                
            }
        };
        FetchSectors();
        fetchEmployees();
    }, []);

    const findNodeByKey = (nodes, key) => {
        for (let node of nodes) {
            if (node.key === key) {
                return node;
            }

            if (node.children) {
                const foundNode = findNodeByKey(node.children, key);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(isUpdate);
        if(isUpdate) {
          setIsUpdate(false);
          const response = await axios.post('https://localhost:7194/editEmployee', {
            
            employeeID : employeeIDToUpdate,
            NewEmployeeName: name,
            NewSectorID: selectedKey
        }); 
        if(response.status == 200) {
          fetchEmployees();
        }
        } else {
          if (!agreeToTerms) {
            alert("Please agree to the terms before submitting.");
            return;
        }
        try {
            const response = await axios.post('https://localhost:7194/SaveEmployee', {
                StoredProcedure: "InsertEmployee",
                EmployeeName: name,
                SectorID: selectedKey
            });

            if (response.data && response.data === "Stored procedure executed successfully!") {
                alert("Data saved successfully");
                setName('');
                setSelectedKey(null);
                setAgreeToTerms(false);
                fetchEmployees();
            } else {
                alert("Error saving data");
            }
        } catch (error) {
            console.error('Error saving employee data:', error);
            alert('Error saving data. Please try again.');
        }

        }

    };


    const fetchEmployees = async () => {
      try {
          const response = await axios.get('https://localhost:7194/GetEmployeeDetailsAsJSON');
          setEmployees(JSON.parse(response.data));
      } catch (error) {
          console.error('Error fetching employees:', error);
          
      }
  };

    const setEdit = (employee) => {
      setName(employee.EmployeeName);
      setSelectedKey(employee.SectorID);
      setemployeeIDToUpdate(employee.EmployeeID);
      setIsUpdate(true);
    } 
    

    return (
        <PrimeReactProvider>
            <div className="App-container">
                <form onSubmit={handleSubmit}>
                    <label>
                        Please enter your name and pick the Sectors you are currently involved in.
                        <br />
                        Name:
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </label>

                    {
                        selectedKey && (
                            <div>
                                Your selected Sector is: {findNodeByKey(nodes, selectedKey)?.label}
                            </div>
                        )
                    }

                    <label>
                        Sectors:
                        <div className="card flex justify-content-center">
                            <Tree value={nodes} expandedKeys={expandedKeys} onToggle={(e) => {
                                const newExpandedKeys = { ...expandedKeys, ...e.value };
                                setExpandedKeys(newExpandedKeys);
                            }} 
                                  selectionMode="single"  selectionKeys={selectedKey} 
                                  onSelectionChange={(e) => setSelectedKey(e.value)} 
                                  className="w-full md:w-30rem" />
                        </div>
                    </label>
                    <div className='agree-terms'>
                    <label>
                        <input type="checkbox" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} required />
                        Agree to terms
                    </label>
                    </div>
                    <div  className='submit'>
                        <input type="submit" value="Save" />
                    </div>
                    <div>
                        <UpdateEmployee onSelect ={setEdit} employees={employees}/> 
                     </div>
                </form>
            </div>
        </PrimeReactProvider>
    );
}

export default App;
