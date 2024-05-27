import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination, Col, Row, Table, Form, FormControl, Button, InputGroup, FormCheck, Modal } from 'react-bootstrap';

interface Record {
    id: number;
    name: string;
    email: string;
    currentTime: string;
  }

const RecordTable: React.FC = () => {
const [records, setRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<Record[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletedFilter, setIsDeletedFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [newRecord, setNewRecord] = useState({ name: '', email: '', isDeleted: false });
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, isDeletedFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
    const response = await axios.get(`https://localhost:44357/api/records?page=${page}&search=${searchQuery}&isDeleted=${isDeletedFilter}`);
    setRecords(response.data);
    
    const responseAll = await axios.get(`https://localhost:44357/api/records?page=${page}&search=${searchQuery}&isDeleted=${isDeletedFilter}&showDeleted=true`);
    const allRecords = responseAll.data;
    setAllRecords(allRecords);
    
    const deletedRecords = allRecords.filter((record: any) => record.isDeleted === true);
    setDeletedRecords(deletedRecords);
    console.log(records, 'records');
    console.log(deletedRecords, 'deleted records');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleIsDeletedFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsDeletedFilter(event.target.checked);
  };

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewRecord({ ...newRecord, [name]: value });
    if (selectedRecord) {
        setSelectedRecord({ ...selectedRecord, [name]: value });
    }
  };

  const handleAddRecord = async () => {
    try {
    const currentDate = new Date().toISOString();
    const recordToAdd = { ...newRecord, currentTime: currentDate };
    const response = await axios.post('https://localhost:44357/api/records', recordToAdd);
      fetchData();
      setShowModal(false);
      setRecords((prevRecords: any[]) => [...prevRecords, response.data]);
      setNewRecord({ name: '', email: '', isDeleted: false });
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const updateRecord = async () => {
    if (!selectedRecord) return;
    try {
      const currentDate = new Date().toISOString();
      const updatedRecord = { ...selectedRecord, currentTime: currentDate };
      await axios.put(`https://localhost:44357/api/records/${selectedRecord.id}`, updatedRecord);
      fetchData();
      setShowModalUpdate(false);
    } catch (error) {
      console.error(`Error updating record with ID:`, error);
    }
  };

  const handleEdit = (record: Record) => {
    setSelectedRecord(record); // selected record when editing
    setShowModalUpdate(true);
  };

  const deleteRecord = async (id: number) => {
    try {
      await axios.delete(`https://localhost:44357/api/records/${id}`);
      fetchData();
    } catch (error) {
      console.error(`Error deleting record with ID ${id}:`, error);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div>
      <Col>
      <Row>
        <InputGroup className="mb-3">
            <FormControl
            placeholder="Search records"
            aria-label="Search records"
            aria-describedby="basic-addon2"
            value={searchQuery}
            onChange={handleSearch}
            />
            {/* <Button variant="outline-secondary">Search</Button> */}
            <FormCheck
            className="m-2"
            type="checkbox"
            label="Show deleted records"
            checked={isDeletedFilter}
            onChange={handleIsDeletedFilter}
            />
        </InputGroup>
      </Row>
      <Row>
        <Button className="mb-3 w-auto ml-custom" variant="primary" onClick={() => setShowModal(true)}>Add Record</Button>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
              <thead>
              <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>DateTime</th>
                  <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {records.map((record: any) => (
                  <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.currentTime}</td>
                  <td>
                      <Button className="m-1" onClick={() => handleEdit(record)}>Update</Button>
                      <Button className="m-1" onClick={() => deleteRecord(record.id)}>Delete</Button>
                  </td>
                  </tr>
              ))}
              </tbody>
          </Table>
        </Col>
        {/* deleted records if checkbox is checked */}
      {isDeletedFilter && (
        <Col>
          <h5>Deleted Records</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>DateTime</th>
              </tr>
            </thead>
            <tbody>
              {deletedRecords.map((record: any) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.currentTime}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      )}
      </Row>
      <Row>
          <Pagination className="ml-2">
            <Pagination.First onClick={() => handlePageChange(1)} />
            <Pagination.Prev onClick={() => handlePageChange(page - 1)} />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next onClick={() => handlePageChange(page + 1)} />
          </Pagination>
        </Row>
      </Col>
      {/* update */}
      <Modal show={showModalUpdate} onHide={() => setShowModalUpdate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={selectedRecord ? selectedRecord.name : ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={selectedRecord ? selectedRecord.email : ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalUpdate(false)}>Close</Button>
          <Button variant="primary" onClick={updateRecord}>Update Record</Button>
        </Modal.Footer>
      </Modal>
      {/* add */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={newRecord.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={newRecord.email}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddRecord}>Add Record</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RecordTable;
