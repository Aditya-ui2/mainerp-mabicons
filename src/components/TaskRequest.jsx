import React, { useState } from 'react';
import { Card, Typography, Input, Textarea, Button } from "@material-tailwind/react";

const TaskRequest = () => {
  const [taskRequest, setTaskRequest] = useState({
    title: '',
    description: '',
    deadline: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Task Request:', taskRequest);
  };

  return (
    <Card className="p-4">
      <Typography variant="h6" className="mb-4">Request New Task</Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Task Title"
          value={taskRequest.title}
          onChange={(e) => setTaskRequest({ ...taskRequest, title: e.target.value })}
          required
        />
        <Textarea
          label="Description"
          rows={4}
          value={taskRequest.description}
          onChange={(e) => setTaskRequest({ ...taskRequest, description: e.target.value })}
          required
        />
        <Input
          type="date"
          label="Preferred Deadline"
          value={taskRequest.deadline}
          onChange={(e) => setTaskRequest({ ...taskRequest, deadline: e.target.value })}
          required
        />
        <Button type="submit">Submit Request</Button>
      </form>
    </Card>
  );
};

export default TaskRequest; 