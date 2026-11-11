import { DocumentRecord } from '../types';

export const SAMPLE_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'sample-doc-1',
    userId: 'user-researcher-01',
    fileName: 'Attention_Mechanisms_And_Transformer_Architectures.pdf',
    fileSize: 2450000,
    pageCount: 12,
    storagePath: 'user-researcher-01/attention_transformers_v2.pdf',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    extractedText: `--- [Page 1] ---
Attention Is All You Need: Architectural Foundations for Sequence-to-Sequence Modeling.
Abstract:
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The Transformer relies entirely on an attention mechanism to draw global dependencies between input and output without recurring network layers.

--- [Page 2] ---
1. Introduction & Background
Recurrent models generate sequences of hidden states h_t as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.
Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.

--- [Page 3] ---
2. Model Architecture
The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.
Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism, and a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization: LayerNorm(x + Sublayer(x)).

--- [Page 4] ---
3. Attention Formulation
An attention function can be described as mapping a query and a set of key-value pairs to an output.
Scaled Dot-Product Attention:
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V
We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values. The scaling factor sqrt(d_k) counteracts extremely small gradients when d_k is large.

--- [Page 5] ---
4. Multi-Head Attention & Positional Encoding
Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions:
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W^O
where head_i = Attention(Q * W_i^Q, K * W_i^K, V * W_i^V).
Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject information about the relative or absolute position of tokens. We use sine and cosine functions of different frequencies for positional encodings.

--- [Page 6] ---
5. Computational Complexity & Scalability
Self-attention layers connect all positions with a constant number of sequentially executed operations O(1), whereas a recurrent layer requires O(n) sequential operations. In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d.`,
    pagesData: [
      {
        pageNum: 1,
        text: 'Attention Is All You Need: Architectural Foundations for Sequence-to-Sequence Modeling. Abstract: The Transformer relies entirely on self-attention mechanisms to eliminate recurrent sequential training bottlenecks.',
      },
      {
        pageNum: 2,
        text: 'Introduction & Background: Recurrent models update hidden states h_t sequentially, preventing parallel computation across sequence tokens.',
      },
      {
        pageNum: 3,
        text: 'Model Architecture: Encoder composed of 6 identical layers with Multi-Head Attention and Position-Wise Feed-Forward networks with residual connections and layer normalization.',
      },
      {
        pageNum: 4,
        text: 'Scaled Dot-Product Attention: Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V. The scaling factor sqrt(d_k) avoids gradient vanishing.',
      },
      {
        pageNum: 5,
        text: 'Multi-Head Attention & Positional Encodings: Sine and cosine functions of varying frequencies inject position information since no recurrence exists.',
      },
      {
        pageNum: 6,
        text: 'Computational Complexity: Self-attention achieves O(1) sequential operation time complexity compared to O(n) in RNNs.',
      },
    ],
  },
  {
    id: 'sample-doc-2',
    userId: 'user-researcher-01',
    fileName: 'Distributed_Consensus_In_Cloud_Databases.pdf',
    fileSize: 1850000,
    pageCount: 8,
    storagePath: 'user-researcher-01/distributed_consensus_raft_paxos.pdf',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    extractedText: `--- [Page 1] ---
Distributed Consensus Protocols in Cloud Architectures: Raft, Paxos, and Multi-Master Replication.
Abstract: Modern cloud databases require fault-tolerant distributed consensus to guarantee linearizability and high availability across geo-distributed nodes under network partitions.

--- [Page 2] ---
1. The CAP Theorem & Linearizability
Brewer's CAP theorem establishes that distributed data stores can only guarantee two out of Consistency, Availability, and Partition Tolerance simultaneously. Under network partitions, systems must choose between consistency (CP) or availability (AP).

--- [Page 3] ---
2. The Raft Consensus Algorithm
Raft decomposes consensus into three independent sub-problems: Leader Election, Log Replication, and Safety. Raft guarantees that if any server has applied a particular log entry to its state machine, no other server may apply a different log entry for the same index.

--- [Page 4] ---
3. Quorum Reads and PostgreSQL Cloud Storage
By requiring write quorums W + R > N, cloud databases ensure read operations will intersect with at least one replica holding the latest committed transaction. Supabase PostgreSQL utilizes streaming replication and WAL journaling to deliver sub-millisecond ACID guarantees.`,
    pagesData: [
      {
        pageNum: 1,
        text: 'Distributed Consensus Protocols in Cloud Architectures: Fault tolerance, linearizability, and high availability.',
      },
      {
        pageNum: 2,
        text: "The CAP Theorem & Linearizability: Systems must choose between Consistency and Availability during network partitions.",
      },
      {
        pageNum: 3,
        text: 'The Raft Consensus Algorithm: Leader election, log replication, and safety mechanisms ensuring single state machine progression.',
      },
      {
        pageNum: 4,
        text: 'Quorum Reads and PostgreSQL Cloud Storage: W + R > N ensures reliable read-write overlaps and transactional durability.',
      },
    ],
  },
];
