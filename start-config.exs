# eclient = Anoma.Client.Examples.EClient.create_example_client
node_id = "babylon control"
{:ok, eclient} = Anoma.Client.connect("192.248.188.47", 50051, 0, node_id)
IO.puts("#{eclient.grpc_port} #{node_id}")
Logger.configure(level: :debug)
# Anoma.Node.Utility.Consensus.start_link(node_id: eclient.node.node_id, interval: 500)
File.write("config.yaml", "url: localhost\nport: #{eclient.grpc_port}\nnodeid: \"\"\n")
