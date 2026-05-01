import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as classrooms, store as classroomsStore } from '@/routes/classrooms';
import type { RoomType } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface CreateProps {
    roomTypes: RoomType[];
}

export default function Create({ roomTypes }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        building: '',
        room_number: '',
        room_name: '',
        capacity: '',
        room_type: 'classroom',
        equipment: [] as string[],
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(classroomsStore.url());
    };

    const addEquipment = () => {
        setData('equipment', [...data.equipment, '']);
    };

    const removeEquipment = (index: number) => {
        setData('equipment', data.equipment.filter((_, i) => i !== index));
    };

    const updateEquipment = (index: number, value: string) => {
        const newEquipment = [...data.equipment];
        newEquipment[index] = value;
        setData('equipment', newEquipment);
    };

    return (
        <>
            <Head title="Create Classroom" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={classrooms()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Classroom</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="building">Building</Label>
                                    <Input
                                        id="building"
                                        value={data.building}
                                        onChange={(e) => setData('building', e.target.value)}
                                        placeholder="e.g., Main Building"
                                        required
                                    />
                                    <InputError message={errors.building} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="room_number">Room Number</Label>
                                    <Input
                                        id="room_number"
                                        value={data.room_number}
                                        onChange={(e) => setData('room_number', e.target.value)}
                                        placeholder="e.g., 101"
                                        required
                                    />
                                    <InputError message={errors.room_number} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="room_name">Room Name (Optional)</Label>
                                <Input
                                    id="room_name"
                                    value={data.room_name}
                                    onChange={(e) => setData('room_name', e.target.value)}
                                    placeholder="e.g., Computer Lab A"
                                />
                                <InputError message={errors.room_name} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', e.target.value)}
                                        placeholder="e.g., 40"
                                        required
                                    />
                                    <InputError message={errors.capacity} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="room_type">Room Type</Label>
                                    <Select
                                        value={data.room_type}
                                        onValueChange={(value) => setData('room_type', value)}
                                    >
                                        <SelectTrigger id="room_type">
                                            <SelectValue placeholder="Select room type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roomTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.room_type} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Equipment</Label>
                                <div className="space-y-2">
                                    {data.equipment.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={item}
                                                onChange={(e) => updateEquipment(index, e.target.value)}
                                                placeholder="e.g., Projector, Whiteboard"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEquipment(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addEquipment}
                                    >
                                        + Add Equipment
                                    </Button>
                                </div>
                                <InputError message={errors.equipment} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="text-sm font-normal">
                                    Active classroom
                                </Label>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Classroom'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={classrooms()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Classrooms', href: classrooms() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
