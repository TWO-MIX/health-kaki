import React, { useState, useEffect } from 'react'
import { X, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MetricConfig {
  type: string
  title: string
  icon: any
  unit: string
  color: string
  bgColor: string
  borderColor: string
}

interface CustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  metricConfigs: MetricConfig[]
  onOrderChange: (newOrder: string[]) => void
  onVisibilityChange: (visibilitySettings: Record<string, boolean>) => void
  currentOrder: string[]
  visibilitySettings: Record<string, boolean>
}

interface SortableItemProps {
  id: string
  config: MetricConfig
  isVisible: boolean
  onToggleVisibility: (id: string) => void
}

const SortableItem: React.FC<SortableItemProps> = ({ id, config, isVisible, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = config.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 xs:p-4 bg-white border-2 rounded-lg xs:rounded-xl transition-all ${
        isDragging ? 'shadow-lg scale-105 z-10' : 'shadow-sm hover:shadow-md'
      } ${isVisible ? 'border-gray-200' : 'border-gray-100 bg-gray-50'}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <GripVertical className="h-4 w-4 xs:h-5 xs:w-5" />
      </div>

      {/* Metric Icon and Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className={`p-2 xs:p-2.5 ${config.bgColor} rounded-lg flex-shrink-0 ${isVisible ? '' : 'opacity-50'}`}>
          <Icon className={`h-4 w-4 xs:h-5 xs:w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm xs:text-base font-semibold truncate ${isVisible ? 'text-gray-900' : 'text-gray-500'}`}>
            {config.title}
          </h3>
          <p className={`text-xs xs:text-sm truncate ${isVisible ? 'text-gray-600' : 'text-gray-400'}`}>
            Measured in {config.unit}
          </p>
        </div>
      </div>

      {/* Visibility Toggle */}
      <button
        onClick={() => onToggleVisibility(id)}
        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
          isVisible
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
        }`}
      >
        {isVisible ? (
          <Eye className="h-4 w-4 xs:h-5 xs:w-5" />
        ) : (
          <EyeOff className="h-4 w-4 xs:h-5 xs:w-5" />
        )}
      </button>
    </div>
  )
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  metricConfigs,
  onOrderChange,
  onVisibilityChange,
  currentOrder,
  visibilitySettings
}) => {
  const [localOrder, setLocalOrder] = useState<string[]>(currentOrder)
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>(visibilitySettings)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (isOpen) {
      setLocalOrder(currentOrder)
      setLocalVisibility(visibilitySettings)
    }
  }, [isOpen, currentOrder, visibilitySettings])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localOrder.indexOf(active.id as string)
      const newIndex = localOrder.indexOf(over.id as string)
      const newOrder = arrayMove(localOrder, oldIndex, newIndex)
      setLocalOrder(newOrder)
    }
  }

  const handleToggleVisibility = (metricType: string) => {
    const newVisibility = {
      ...localVisibility,
      [metricType]: !localVisibility[metricType]
    }
    setLocalVisibility(newVisibility)
  }

  const handleSave = () => {
    onOrderChange(localOrder)
    onVisibilityChange(localVisibility)
    onClose()
  }

  const handleReset = () => {
    const defaultOrder = metricConfigs.map(config => config.type)
    const defaultVisibility = metricConfigs.reduce((acc, config) => {
      acc[config.type] = true
      return acc
    }, {} as Record<string, boolean>)
    
    setLocalOrder(defaultOrder)
    setLocalVisibility(defaultVisibility)
  }

  const visibleCount = Object.values(localVisibility).filter(Boolean).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 xs:p-4">
      <div className="bg-white rounded-lg xs:rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xs:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg xs:text-xl font-bold text-gray-900">Customize Dashboard</h2>
            <p className="text-xs xs:text-sm text-gray-600 mt-1">
              Drag to reorder • Toggle to show/hide
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 xs:p-6">
          {/* Status Info */}
          <div className="mb-4 xs:mb-6 p-3 xs:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">
                {visibleCount} of {metricConfigs.length} metrics visible
              </span>
              {visibleCount === 0 && (
                <span className="text-orange-600 text-xs font-medium">
                  ⚠️ At least one metric should be visible
                </span>
              )}
            </div>
          </div>

          {/* Sortable List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 xs:space-y-3">
                {localOrder.map((metricType) => {
                  const config = metricConfigs.find(c => c.type === metricType)
                  if (!config) return null

                  return (
                    <SortableItem
                      key={metricType}
                      id={metricType}
                      config={config}
                      isVisible={localVisibility[metricType]}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>

          {/* Instructions */}
          <div className="mt-4 xs:mt-6 p-3 xs:p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">How to customize:</h4>
            <ul className="text-xs xs:text-sm text-gray-600 space-y-1">
              <li>• <strong>Drag</strong> the grip handle to reorder metrics</li>
              <li>• <strong>Click the eye icon</strong> to show/hide metrics</li>
              <li>• Hidden metrics won't appear on your dashboard</li>
              <li>• You can still add readings for hidden metrics</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 xs:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 xs:px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-2 xs:space-x-3">
            <button
              onClick={onClose}
              className="px-3 xs:px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={visibleCount === 0}
              className={`px-4 xs:px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                visibleCount === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizationModal
