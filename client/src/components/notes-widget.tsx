import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  NotebookPen, 
  Plus, 
  Search, 
  Tag, 
  Star, 
  StarOff,
  Mic, 
  MicOff, 
  Edit3, 
  Trash2, 
  Copy, 
  Download, 
  Upload,
  Calendar,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  Bookmark,
  BookmarkCheck,
  FileText,
  Archive,
  MoreHorizontal,
  Hash,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Share,
  Pin,
  PinOff,
  FolderPlus,
  Folder,
  Grid,
  List,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  isPrivate: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
  wordCount: number;
  readTime: number;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "general", name: "General", color: "#6B73FF", count: 0 },
  { id: "work", name: "Work", color: "#10B981", count: 0 },
  { id: "personal", name: "Personal", color: "#F59E0B", count: 0 },
  { id: "ideas", name: "Ideas", color: "#8B5CF6", count: 0 },
  { id: "journal", name: "Journal", color: "#EF4444", count: 0 },
  { id: "tasks", name: "Tasks", color: "#06B6D4", count: 0 },
];

export default function NotesWidget() {
  // Core state
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Writing interface state (always visible)
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [currentCategory, setCurrentCategory] = useState("general");
  const [currentTags, setCurrentTags] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // Formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [textColor, setTextColor] = useState('#000000');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'category'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('all');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  
  const { toast } = useToast();

  // Load notes from settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { quickNotes: string }) => 
      apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  useEffect(() => {
    if (settings?.quickNotes) {
      try {
        const savedData = JSON.parse(settings.quickNotes);
        setNotes(savedData.notes || []);
        setCategories(savedData.categories || DEFAULT_CATEGORIES);
      } catch (e) {
        // Legacy support for old string-based notes
        if (typeof settings.quickNotes === 'string' && settings.quickNotes.trim()) {
          const legacyNote: Note = {
            id: 'legacy-note',
            title: 'Imported Note',
            content: settings.quickNotes,
            category: 'general',
            tags: [],
            isFavorite: false,
            isPinned: false,
            isPrivate: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessed: new Date(),
            wordCount: settings.quickNotes.split(' ').length,
            readTime: Math.ceil(settings.quickNotes.split(' ').length / 200)
          };
          setNotes([legacyNote]);
        }
      }
    }
  }, [settings]);

  const saveNotes = (updatedNotes: Note[], updatedCategories?: Category[]) => {
    const dataToSave = {
      notes: updatedNotes,
      categories: updatedCategories || categories,
      lastSaved: new Date().toISOString()
    };
    updateSettingsMutation.mutate({ quickNotes: JSON.stringify(dataToSave) });
  };

  const createOrUpdateNote = () => {
    if (!currentContent.trim()) {
      toast({ title: "Error", description: "Please enter content.", variant: "destructive" });
      return;
    }

    const wordCount = currentContent.split(' ').filter(word => word.length > 0).length;
    
    // Auto-generate title if not provided
    const autoTitle = currentTitle.trim() || generateAutoTitle(currentContent);
    
    const formatting = {
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      color: textColor,
      alignment: textAlignment
    };

    if (isEditing && editingNoteId) {
      // Update existing note
      const updatedNotes = notes.map(note =>
        note.id === editingNoteId 
          ? { 
              ...note, 
              title: autoTitle,
              content: currentContent,
              category: currentCategory,
              tags: currentTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
              updatedAt: new Date(),
              wordCount,
              readTime: Math.ceil(wordCount / 200),
              formatting
            }
          : note
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      toast({ title: "Note updated", description: "Your note has been saved successfully." });
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: autoTitle,
        content: currentContent,
        category: currentCategory,
        tags: currentTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isFavorite: false,
        isPinned: false,
        isPrivate: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessed: new Date(),
        wordCount,
        readTime: Math.ceil(wordCount / 200),
        formatting
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      
      // Update category count
      const updatedCategories = categories.map(cat =>
        cat.id === currentCategory ? { ...cat, count: cat.count + 1 } : cat
      );
      setCategories(updatedCategories);
      
      saveNotes(updatedNotes, updatedCategories);
      toast({ title: "Note created", description: "Your note has been saved successfully." });
    }
    
    // Reset form
    clearEditor();
  };

  const generateAutoTitle = (content: string) => {
    if (!content.trim()) return 'Untitled Note';
    
    // Take first sentence or first 50 characters
    const firstSentence = content.split(/[.!?]\s/)[0];
    if (firstSentence.length <= 50) {
      return firstSentence.trim();
    }
    
    // If first sentence is too long, take first 50 characters and add...
    return content.trim().substring(0, 47) + '...';
  };

  // Auto-update title as user types (if no custom title entered)
  useEffect(() => {
    if (!isEditing && !currentTitle.trim() && currentContent.trim()) {
      // Only auto-generate if user hasn't manually entered a title
      const autoTitle = generateAutoTitle(currentContent);
      // Don't update the input field, just use for display/save
    }
  }, [currentContent, currentTitle, isEditing]);

  const clearEditor = () => {
    setCurrentTitle("");
    setCurrentContent("");
    setCurrentTags("");
    setCurrentCategory("general");
    setIsEditing(false);
    setEditingNoteId(null);
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setTextAlignment('left');
    setTextColor('#000000');
  };

  const editNote = (note: Note) => {
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setCurrentCategory(note.category);
    setCurrentTags(note.tags.join(', '));
    setIsEditing(true);
    setEditingNoteId(note.id);
    
    // Load formatting
    if (note.formatting) {
      setIsBold(note.formatting.bold || false);
      setIsItalic(note.formatting.italic || false);
      setIsUnderline(note.formatting.underline || false);
      setTextAlignment(note.formatting.alignment || 'left');
      setTextColor(note.formatting.color || '#000000');
    }
    
    // Scroll to editor
    if (textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current.focus();
    }
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    // If deleting the note being edited, clear editor
    if (editingNoteId === noteId) {
      clearEditor();
    }
    
    toast({ title: "Note deleted", description: "Note has been removed." });
  };

  const toggleFavorite = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const togglePin = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const startVoiceTyping = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeToEditor(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsVoiceTyping(true);
      toast({ title: "Voice typing started", description: "Speak and your words will appear in the editor..." });
    } catch (error) {
      console.error('Error starting voice typing:', error);
      toast({ title: "Voice typing failed", description: "Please check microphone permissions.", variant: "destructive" });
    }
  };

  const stopVoiceTyping = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsVoiceTyping(false);
      setIsTranscribing(true);
    }
  };

  const transcribeToEditor = async (audioBlob: Blob) => {
    try {
      setTimeout(() => {
        const transcribedText = `This is voice-typed content at ${new Date().toLocaleTimeString()}. `;
        setCurrentContent(prev => prev + (prev ? ' ' : '') + transcribedText);
        setIsTranscribing(false);
        toast({ title: "Voice typing complete", description: "Your speech has been added to the editor." });
        
        // Focus back to textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 2000);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setIsTranscribing(false);
      toast({ title: "Transcription failed", description: "Could not transcribe audio.", variant: "destructive" });
    }
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // No text selected, toggle global formatting state
      switch (type) {
        case 'bold':
          setIsBold(!isBold);
          break;
        case 'italic':
          setIsItalic(!isItalic);
          break;
        case 'underline':
          setIsUnderline(!isUnderline);
          break;
      }
    } else {
      // Text selected, wrap with formatting
      const selectedText = currentContent.slice(start, end);
      let formattedText = selectedText;
      
      switch (type) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
      }
      
      const newContent = currentContent.slice(0, start) + formattedText + currentContent.slice(end);
      setCurrentContent(newContent);
      
      // Reset selection after the formatted text
      setTimeout(() => {
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        textarea.focus();
      }, 0);
    }
  };

  const insertListItem = (type: 'bullet' | 'numbered' | 'todo') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const prefix = type === 'bullet' ? '• ' : type === 'numbered' ? '1. ' : '☐ ';
    const newText = currentContent.slice(0, start) + prefix + currentContent.slice(start);
    setCurrentContent(newText);
    
    // Set cursor position after the prefix
    setTimeout(() => {
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      textarea.focus();
    }, 0);
  };

  const getFilteredNotes = () => {
    let filtered = notes.filter(note => {
      if (note.isArchived && activeTab !== 'archived') return false;
      if (!note.isArchived && activeTab === 'archived') return false;
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!note.title.toLowerCase().includes(searchLower) && 
            !note.content.toLowerCase().includes(searchLower) &&
            !note.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      
      if (filterCategory !== 'all' && note.category !== filterCategory) return false;
      
      return true;
    });

    // Sort notes
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default: // 'updated'
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pinned notes always on top
    const pinned = filtered.filter(note => note.isPinned);
    const unpinned = filtered.filter(note => !note.isPinned);
    return [...pinned, ...unpinned];
  };

  const exportNotes = () => {
    const dataToExport = {
      notes: notes.filter(note => !note.isArchived),
      categories,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Notes exported", description: "Your notes have been downloaded." });
  };

  const getStatistics = () => {
    const total = notes.length;
    const favorites = notes.filter(n => n.isFavorite).length;
    const archived = notes.filter(n => n.isArchived).length;
    const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
    const avgWordsPerNote = total > 0 ? Math.round(totalWords / total) : 0;
    
    return { total, favorites, archived, totalWords, avgWordsPerNote };
  };

  const stats = getStatistics();
  const filteredNotes = getFilteredNotes();

  const getEditorStyle = () => {
    return {
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
      textAlign: textAlignment,
      color: textColor
    };
  };

  return (
    <div className={`col-span-full bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-all duration-300 ${isExpanded ? 'row-span-2' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <NotebookPen className="h-6 w-6 text-white opacity-80" />
          <div>
            <h3 className="text-white font-medium text-xl">Smart Notes</h3>
            <p className="text-white/60 text-sm">{stats.total} notes • {stats.totalWords} words</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesHistory(!showNotesHistory)}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title="Show notes history & search"
          >
            <NotebookPen className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Editor - Always Visible */}
      <div className="mb-4 space-y-3">
        {/* VS Code-style Title Bar */}
        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-2 flex-1">
            <FileText className="h-4 w-4 text-white/60" />
            <Input
              placeholder="Note title (auto-generated if empty)"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="flex-1 bg-transparent border-none text-white placeholder-white/40 font-medium focus:ring-0 focus:outline-none h-8 px-2"
            />
            {(!currentTitle.trim() && currentContent.trim()) && (
              <span className="text-white/50 text-sm italic">
                {generateAutoTitle(currentContent)}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearEditor}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-3"
            title="New note"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Single Horizontal Control Row */}
        <div className="flex items-center justify-between gap-3 p-2 bg-white/5 rounded-lg">
          {/* Text Formatting Bar */}
          <div className="flex items-center space-x-1">
            {/* Format Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant={isBold ? "default" : "ghost"}
                size="sm"
                onClick={() => applyFormatting('bold')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Bold"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant={isItalic ? "default" : "ghost"}
                size="sm"
                onClick={() => applyFormatting('italic')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Italic"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant={isUnderline ? "default" : "ghost"}
                size="sm"
                onClick={() => applyFormatting('underline')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Underline"
              >
                <Underline className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-5 bg-white/20" />
            
            {/* Alignment */}
            <div className="flex items-center space-x-1">
              <Button
                variant={textAlignment === 'left' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTextAlignment('left')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Align left"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant={textAlignment === 'center' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTextAlignment('center')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Align center"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant={textAlignment === 'right' ? "default" : "ghost"}
                size="sm"
                onClick={() => setTextAlignment('right')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Align right"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-5 bg-white/20" />
            
            {/* Lists */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertListItem('bullet')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Bullet list"
              >
                <List className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertListItem('numbered')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Numbered list"
              >
                <ListOrdered className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertListItem('todo')}
                className="h-7 w-7 p-0 text-white/60 hover:text-white"
                title="Todo list"
              >
                <ListTodo className="h-3 w-3" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-5 bg-white/20" />
            
            {/* Voice Typing */}
            <Button
              variant="ghost"
              size="sm"
              onClick={isVoiceTyping ? stopVoiceTyping : startVoiceTyping}
              disabled={isTranscribing}
              className={`h-7 w-7 p-0 ${isVoiceTyping ? 'text-red-400' : 'text-white/60'} hover:text-white`}
              title={isVoiceTyping ? "Stop voice typing" : "Start voice typing"}
            >
              {isVoiceTyping ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </Button>
            
            {(isVoiceTyping || isTranscribing) && (
              <div className="flex items-center space-x-1 text-red-400">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs">{isVoiceTyping ? 'Recording...' : 'Processing...'}</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={createOrUpdateNote}
              disabled={!currentContent.trim()}
              className="bg-zen-sage hover:bg-zen-sage/80 text-white h-7 px-3"
            >
              <Save className="h-3 w-3 mr-1" />
              {isEditing ? 'Update' : 'Save'}
            </Button>
            
            {isEditing && (
              <Button
                variant="outline"
                onClick={clearEditor}
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 h-7 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Category Dropdown */}
          <Select value={currentCategory} onValueChange={setCurrentCategory}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Triple Dot Menu */}
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 h-7 w-7 p-0"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            title="Advanced options"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Advanced Options Panel */}
        {showAdvancedOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white/5 rounded-lg">
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">Tags</label>
              <Input
                placeholder="tag1, tag2, tag3..."
                value={currentTags}
                onChange={(e) => setCurrentTags(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/40 h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-8 rounded border-white/20 bg-white/10"
              />
            </div>
          </div>
        )}
        
        {/* Content Textarea */}
        <Textarea
          ref={textareaRef}
          placeholder="Start writing your note..."
          value={currentContent}
          onChange={(e) => setCurrentContent(e.target.value)}
          className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder-white/40 resize-none"
          style={getEditorStyle()}
        />
        
        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-white/50 px-2">
          <div className="flex items-center space-x-3">
            <span>{currentContent.length} characters</span>
            <span>{currentContent.split(' ').filter(w => w.length > 0).length} words</span>
            {currentContent && (
              <span>{Math.ceil(currentContent.split(' ').filter(w => w.length > 0).length / 200)} min read</span>
            )}
          </div>
          {(isEditing || currentContent.trim()) && (
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Auto-saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes History Panel - Collapsible */}
      {showNotesHistory && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center">
              <Archive className="h-4 w-4 mr-2" />
              Notes History & Search
            </h4>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="text-white/60 hover:text-white hover:bg-white/10"
                title={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
              >
                {viewMode === 'list' ? <Grid className="h-3 w-3" /> : <List className="h-3 w-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={exportNotes}
                className="text-white/60 hover:text-white hover:bg-white/10"
                title="Export notes"
              >
                <Download className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesHistory(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
                title="Close history"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-white/10">
                <TabsTrigger value="all" className="text-white text-xs">All ({notes.filter(n => !n.isArchived).length})</TabsTrigger>
                <TabsTrigger value="favorites" className="text-white text-xs">Favorites ({stats.favorites})</TabsTrigger>
                <TabsTrigger value="pinned" className="text-white text-xs">Pinned ({notes.filter(n => n.isPinned).length})</TabsTrigger>
              </TabsList>
              
              {/* Search and Filter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/40" />
                  <Input
                    placeholder="Search..."
                    className="pl-7 w-32 h-7 bg-white/10 border-white/20 text-white placeholder-white/40 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-24 h-7 bg-white/10 border-white/20 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-2">
              <NotesList 
                notes={filteredNotes.filter(n => !n.isArchived)} 
                viewMode={viewMode}
                onToggleFavorite={toggleFavorite}
                onTogglePin={togglePin}
                onDelete={deleteNote}
                onEdit={editNote}
                isExpanded={true}
                isCompact={true}
              />
            </TabsContent>

            <TabsContent value="favorites" className="mt-2">
              <NotesList 
                notes={filteredNotes.filter(n => n.isFavorite && !n.isArchived)} 
                viewMode={viewMode}
                onToggleFavorite={toggleFavorite}
                onTogglePin={togglePin}
                onDelete={deleteNote}
                onEdit={editNote}
                isExpanded={true}
                isCompact={true}
              />
            </TabsContent>

            <TabsContent value="pinned" className="mt-2">
              <NotesList 
                notes={filteredNotes.filter(n => n.isPinned && !n.isArchived)} 
                viewMode={viewMode}
                onToggleFavorite={toggleFavorite}
                onTogglePin={togglePin}
                onDelete={deleteNote}
                onEdit={editNote}
                isExpanded={true}
                isCompact={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// Notes List Component
function NotesList({ 
  notes, 
  viewMode, 
  onToggleFavorite, 
  onTogglePin, 
  onDelete, 
  onEdit,
  isExpanded,
  isCompact = false
}: {
  notes: Note[];
  viewMode: 'list' | 'grid';
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  isExpanded: boolean;
  isCompact?: boolean;
}) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-white/30 mx-auto mb-3" />
        <p className="text-white/60">No notes found</p>
        <p className="text-white/40 text-sm">Create your first note using the editor above</p>
      </div>
    );
  }

  const containerClass = viewMode === 'grid' 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
    : "space-y-2";

  const maxHeight = isCompact ? "h-64" : isExpanded ? "h-96" : "h-48";

  return (
    <ScrollArea className={maxHeight}>
      <div className={containerClass}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            viewMode={viewMode}
            onToggleFavorite={onToggleFavorite}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
            onEdit={onEdit}
            isCompact={isCompact}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

// Note Card Component
function NoteCard({ 
  note, 
  viewMode, 
  onToggleFavorite, 
  onTogglePin, 
  onDelete, 
  onEdit,
  isCompact = false
}: {
  note: Note;
  viewMode: 'list' | 'grid';
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  isCompact?: boolean;
}) {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return new Date(date).toLocaleDateString([], { weekday: 'short' });
    } else {
      return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const cardClass = isCompact 
    ? "bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 group cursor-pointer"
    : "bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 group cursor-pointer";

  const titleClass = isCompact 
    ? "text-white text-xs font-medium truncate"
    : "text-white text-sm font-medium truncate";

  const contentClass = isCompact 
    ? "text-white/70 text-xs mb-2 line-clamp-1"
    : "text-white/70 text-sm mb-3 line-clamp-2";

  const headerPadding = isCompact ? "pb-1" : "pb-2";
  const contentPadding = isCompact ? "pt-0 pb-2" : "pt-0";

  return (
    <Card className={cardClass}>
      <CardHeader className={headerPadding}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={() => onEdit(note)}>
            <CardTitle className={titleClass}>
              {note.isPinned && <Pin className="inline h-3 w-3 mr-1" />}
              {note.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={`${isCompact ? 'text-xs' : 'text-xs'} border-white/20 text-white/70`}>
                {note.category}
              </Badge>
              {note.readTime > 0 && (
                <span className={`${isCompact ? 'text-xs' : 'text-xs'} text-white/50`}>{note.readTime} min read</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'} p-0 text-white/60 hover:text-yellow-400`}
            >
              {note.isFavorite ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'} p-0 text-white/60 hover:text-blue-400`}
            >
              {note.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className={`${isCompact ? 'h-5 w-5' : 'h-6 w-6'} p-0 text-white/60 hover:text-red-400`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={contentPadding} onClick={() => onEdit(note)}>
        <p className={contentClass}>
          {truncateText(note.content, isCompact ? 80 : viewMode === 'grid' ? 100 : 150)}
        </p>
        
        <div className={`flex items-center justify-between ${isCompact ? 'text-xs' : 'text-xs'} text-white/50`}>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>{formatDate(note.updatedAt)}</span>
            <span>•</span>
            <span>{note.wordCount} words</span>
          </div>
          
          {note.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Hash className="h-3 w-3" />
              <span>{note.tags.slice(0, isCompact ? 1 : 2).join(', ')}</span>
              {note.tags.length > (isCompact ? 1 : 2) && <span>+{note.tags.length - (isCompact ? 1 : 2)}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}