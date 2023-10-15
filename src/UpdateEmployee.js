import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';




function UpdateEmployee({ onSelect,employees}) {
    
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [reRender, setreRender] = useState(0);



   
    useEffect(() => {
        setreRender(reRender+1);

    }, [employees]);
   

    const onEmployeeSelect = (e) => {
        setSelectedEmployee(e.value);
        onSelect(e.value);
    };


    return (
        <DataTable value={employees} selection={selectedEmployee} onSelectionChange={e => onEmployeeSelect(e)} selectionMode="single">
    <Column field="EmployeeName" header="Name" />
    <Column field="SectorName" header="Sector" />
</DataTable>

    )
    
}


export default UpdateEmployee;